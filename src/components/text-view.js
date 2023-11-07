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
import './def-popup.js';
import './more-button.js';

import {html, LitElement} from 'lit-element';

import {services} from '../services.js';

class TextView extends LitElement {

  static get properties() {
    return {
      language : {type : String},
      location : {type : String},
      paragraph : {type : Number},
      defWord : {type : String}
    };
  }

  render() {
    return html`
      <style>
        #scroller { height: calc(100vh - 120px); overflow: auto; }
        #content > :nth-child(n +${this.paragraph + 2}) { display: none; }
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

  get location() {
    return this.work + "." + this.chapter;
  }

  set location(value) {
    if(value) {
      // parse location
      let [work, chapter] = value.split(".");
      this.work = work;
      this.chapter = chapter ? Number(chapter) : 0;

      // get TOC for work
      fetch(this.language + '/txt/' + work + '/toc.json')
          .then(function(response) {
            return response.json();
          })
          .then(function(json) {
            this.filecount = json.length;
          }.bind(this));

      // get content file
      const file = ("000" + this.chapter).substr(-3, 3);
      const path = this.language + "/txt/" + work + "/t" + file + ".html";
      this.docInfo = [];
      fetch(path)
          .then(function(response) {
            return response.text();
          })
          .then(function(html) {
            const content = this.shadowRoot.getElementById("content");
            content.innerHTML = html;
            for(const para of content.children) {
              let hash = {};
              let linkList = para.querySelectorAll("a");
              for(const link of linkList) {
                // get base word + type
                const base = this.baseWord(link);
                const type = link.dataset.type;
                // hash for docInfo
                hash[base + ":" + type] = true;
                // set event handler to show def
                link.addEventListener('click', this.showDef.bind(this));
                // title for rollover
                link.title = base;
              }
              const keys = [];
              for(const key in hash) {
                let [word, type] = key.split(":");
                keys.push({word : word, type : type});
              }
              this.docInfo.push(keys);
            }
            // TODO: lookup last paragraph read and show to there
            this.paragraph = 0;
          }.bind(this));
    }
  }

  baseWord(elem) {
    if(elem.dataset.base) {
      return elem.dataset.base;
    } else if(elem.dataset.word) {
      return elem.dataset.word;
    } else {
      return elem.textContent;
    }
  }

  next() {
    // console.log("next()", this.chapter, this.filecount);
    // no more paragraphs in this file
    if(this.paragraph == this.docInfo.length - 1) {
      // request next file if exists
      if(this.chapter < this.filecount) {
        const nextFile = parseInt(this.chapter) + 1;
        // save bookmark position
        localStorage.setItem("bkmk-" + this.work, nextFile);
        // request next page
        const href = `/${this.language}/read/${this.work}.${this.chapter + 1}`;
        window.dispatchEvent(new CustomEvent('link', {detail : href}));
      }
      // no more files - finished with title
      else {
        alert("fin");
        // remove bookmarker
        localStorage.removeItem("bkmk-" + this.work);
        // notify title complete
        this.dispatchEvent(new CustomEvent('work-complete', {bubbles : true, composed : true}));
      }
    } else {
      // move to next paragraph, show quiz if unknown words
      let newWords = this.unknownWords(this.docInfo[this.paragraph++]);
      if(newWords.length) {
        this.dispatchEvent(new CustomEvent('new-words', {detail : newWords}));
      }
    }
  }

  unknownWords(list) {
    return list.filter(item => { return item.type != 'M' && !services.wordservice.isKnown(this.language, item); });
  }

  showDef(evt) {
    const elem = evt.target;
    const word = elem.dataset.word;
    this.defWord =
        JSON.stringify({word : word ? word : elem.textContent, root : elem.dataset.base, type : elem.dataset.type});
  }
}

window.customElements.define('text-view', TextView);
