/*
 * This file is part of QuizReader.
 *
 * QuizReader is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * QuizReader is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with QuizReader.  If not, see <http://www.gnu.org/licenses/>.
 */
import { LitElement, html } from 'lit-element';
import './def-popup.js';
import './more-button.js';
import { WordService } from '../services/word-service.js';

class TextView extends LitElement {

  static get properties() {
    return {
      language: { type: String },
      work: { type: String },
      chapter: { type: String },
      paragraph: { type: Number },
      defWord: { type: String }
    };
  }

  render() {
    return html `
      <style>
        #scroller { height: calc(100vh - 120px); overflow: auto; }
        #content > :nth-child(n +${this.paragraph+2}) { display: none; }
      </style>
      <div id="scroller">
        <div id="content">
        </div>
        <more-button @click="${this.next}"></more-button>
      </div>
      <def-popup language="${this.language}" work="${this.work}" word="${this.defWord}"></def-popup>`;
  }

  constructor() {
    super();
    this.file = 0;
    this.paragraph = 0;
    this.defWord = "null";
  }

  get language() { return this._language; }

  set language(value) {
    if (value) {
      this._language = value;
      this.wordService = WordService.instance(value);
    }
  }

  get work() { return this._work; }

  set work(value) {
    if (value) {
      this._work = value;
      fetch(this.language + '/txt/' + value + '/toc.json')
        .then(function (response) { return response.json(); })
        .then(function (json) {
          this.filecount = json.length;
        }.bind(this));
    }
  }

  get chapter() { return this._chapter; }

  set chapter(value) {
    if (value) {
      this._chapter = value;
      const file = ("000" + value).substr(-3, 3);
      const path = this.language + "/txt/" + this.work + "/t" + file + ".html";
      this.docInfo = [];
      fetch(path)
        .then(function (response) {
          return response.text();
        })
        .then(function (html) {
          const content = this.shadowRoot.getElementById("content");
          content.innerHTML = html;
          for (const para of content.children) {
            let hash = {};
            let linkList = para.querySelectorAll("a");
            for (const link of linkList) {
              const base = this.baseWord(link);
              link.addEventListener('click', this.showDef.bind(this));
              link.title = base;
              const key = base + ":" + link.dataset.type;
              hash[key] = true;
            }
            const keys = [];
            for (const key in hash) {
              let [word, type] = key.split(":");
              keys.push({ word: word, type: type });
            }
            this.docInfo.push(keys);
          }
          // TODO: lookup last paragraph read and show to there
          this.paragraph = 0;
        }.bind(this));
    }
  }

  baseWord(elem) {
    if (elem.dataset.base) {
      return elem.dataset.base;
    } else if (elem.dataset.word) {
      return elem.dataset.word;
    } else {
      return elem.textContent;
    }
  }

  next() {
    // no more paragraphs in this file
    if (this.paragraph == this.docInfo.length - 1) {
      // request next file if exists
      if (this.chapter < this.filecount) {
        const nextFile = parseInt(this.chapter) + 1;
        // save bookmark position
        localStorage.setItem("bkmk-" + this.work, nextFile);
        // notify chapter complete
        this.dispatchEvent(new CustomEvent('chapter-complete', { bubbles: true, composed: true, detail: nextFile }));
      }
      // no more files - finished with title
      else {
        alert("fin");
        // remove bookmarker
        localStorage.removeItem("bkmk-" + this.work);
        // notify title complete
        this.dispatchEvent(new CustomEvent('work-complete', { bubbles: true, composed: true }));
      }
    } else {
      // move to next paragraph, show quiz if unknown words
      let newWords = this.unknownWords(this.docInfo[this.paragraph++]);
      if(newWords.length) {
          this.dispatchEvent(new CustomEvent('new-words', { detail: newWords }));    	 
      }
    }
  }

  unknownWords(list) {
    return list.filter(item => { return item.type != 'M' && !this.wordService.isKnown(item); });
  }

  showDef(evt) {
    const elem = evt.target;
    const word = elem.dataset.word;
    this.defWord = JSON.stringify({
      word: word ? word : elem.textContent,
      root: elem.dataset.base,
      type: elem.dataset.type
    });
  }
}

window.customElements.define('text-view', TextView);
