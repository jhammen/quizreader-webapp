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
import './source-info.js';

import {html, LitElement} from 'lit-element';

import {DefinitionService} from '../services/definition-service.js';
import {WordService} from '../services/word-service.js';

const OPTIONS_COUNT = 3;

class QuizView extends LitElement {

  static get properties() {
    return {
      choice : Array,    // definition choices
      language : String, // language code
      word : Object,     // current quiz word
      sources : Array,   // def attribution sources
      colors : Array,    // choice highlight colors
      complete : Boolean,
      correct : Boolean
    };
  }

  render() {
    return html`
      <style>
      .choice {
        border: 1px solid #CCCCCC;
        margin-top: 3px;
        border-radius: 7px;
        cursor: pointer;
      }
      .right { background-color: green; }
      .wrong { background-color: red; }
      </style>
      <div>
        <h3>${this.word.word}</h3>
        ${
        this.choice.map((val, i) =>
                            html`<div class="choice ${this.selected[i]}" data-choice="${i}" @click="${this.choose}">
          <ul>${val.map((txt) => html`<li>${txt}</li>`)}
          </ul>
          </div>`)}
      </div>
      <br/>
      ${
        Object.keys(this.sources)
            .map((val, i) => html`<source-info label="definition source" source="${val}"></source-info>`)}
      <br/>
      <more-button @click="${this.finished}"></more-button>
    `;
  }

  constructor() {
    super();
    this.sources = [];
    this._word = {};
    this.reset();
  }

  reset() {
    this.complete = false;
    this.correct = false;
    this.choice = Array(OPTIONS_COUNT);
    this.selected = Array(OPTIONS_COUNT);
    this.sources = {};
  }

  set language(value) {
    if(value) {
      this.definitionService = DefinitionService.instance(value);
      this.wordService = WordService.instance(value);
    }
  }

  get word() {
    return this._word;
  }

  set word(value) {
    if(value) {
      const oldValue = this._word;
      this._word = JSON.parse(value);
      this.reset();
      this.addWord(this._word, true);
      for(var i = 0; i < OPTIONS_COUNT - 1; i++) {
        this.addWord(this.wordService.randomWord(this._word.type), false);
      }
      this.requestUpdate('word', oldValue);
    }
  }

  randomIndex() {
    const open = [];
    for(var i = 0; i < OPTIONS_COUNT; i++) {
      if(!this.choice[i]) {
        open.push(i);
      }
    }
    return open[Math.floor(Math.random() * Math.floor(open.length))];
  }

  addWord(word, correct) {
    this.definitionService.getDefinitions(word.word, word.type).then(function(defs) {
      const index = this.randomIndex();
      if(correct) {
        this.answer = index;
      }
      if(defs.length) {
        this.choice[index] = defs.map(item => item.x).slice(0, 3);
        defs.map(item => this.sources[item.s] = true);
        this.requestUpdate();
      } else {
        this.choice[index] = [ "[none of the above]" ];
        this.requestUpdate();
      }
    }.bind(this));
  }

  finished() {
    if(this.correct) {
      this.wordService.save(this.word).then((count) =>
                                                window.dispatchEvent(new CustomEvent('word-count', {detail : count})));
    }
    this.dispatchEvent(new CustomEvent('complete', {detail : this.correct}));
  }

  choose(evt) {
    if(!this.complete) {
      // find choice on outer element
      let elem = evt.target;
      let choice = elem.dataset.choice;
      while(!choice) {
        elem = elem.parentElement;
        choice = elem.dataset.choice;
      }
      const index = parseInt(choice);
      this.correct = this.answer === index;
      this.selected[index] = this.correct ? "right" : "wrong";
      this.complete = true;
      this.requestUpdate();
    }
  }
}

window.customElements.define('quiz-view', QuizView); // needed?
