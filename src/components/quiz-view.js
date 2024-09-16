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
import "./source-info.js";

import { html, LitElement } from "lit-element";

import { services } from "../services.js";

const OPTIONS_COUNT = 3;

class QuizView extends LitElement {
  static get properties() {
    return {
      language: String, // language code
      word: Object // current quiz word
    };
  }

  render() {
    return html`
      <style>
        .choice {
          border: 1px solid #cccccc;
          margin-top: 3px;
          border-radius: 7px;
          cursor: pointer;
        }
        .right {
          background-color: #c5ffc5;
        }
        .wrong {
          background-color: #ffc5c5;
        }
      </style>
      <div>
        <h3>${this.word.word}</h3>
        ${this.choice.map(
          (val, i) =>
            html`<div
              class="choice ${this.selstyle(i)}"
              data-choice="${i}"
              @click="${this.choose}"
            >
              <ul>
                ${val.map((txt) => html`<li>${txt}</li>`)}
              </ul>
            </div>`
        )}
      </div>
      <br />
      ${Object.keys(this.sources).map(
        (val, i) =>
          html`<source-info
            label="definition source"
            source="${val}"
          ></source-info>`
      )}
      <br />
      <more-button @click="${this.finished}"></more-button>
    `;
  }

  // css style for selected answer
  selstyle(i) {
    return this.selected == i ? (this.correct() ? "right" : "wrong") : "";
  }

  constructor() {
    super();
    this.choice = [];
    this._word = {};
    this.reset();
  }

  reset() {
    this.selected = null;
    this.sources = {};
  }

  get word() {
    return this._word;
  }

  set word(value) {
    if (value) {
      this._word = JSON.parse(value);
      this.reset();
      // select some words for incorrect definitions
      const type = this._word.type;
      const chosen = [];
      chosen.push(this._word.word);
      for (var i = 1; i < OPTIONS_COUNT; i++) {
        const rand = services.wordservice.randomWord(type, chosen);
        if (rand) {
          chosen.push(rand.word);
        }
      }
      const count = chosen.length;
      this.choice = Array(count);
      // add correct answer
      this.answer = Math.floor(count * Math.random());
      this.addChoice(this._word, this.answer);
      // array to store used indices
      const used = Array(count);
      used[this.answer] = true;
      // add incorrect answers
      for (var i = 1; i < chosen.length; i++) {
        const index = this.randomIndex(used);
        this.addChoice({ word: chosen[i], type: type }, index);
        used[index] = true;
      }
    }
  }

  randomIndex(used) {
    // private
    const open = [];
    for (var i = 0; i < used.length; i++) {
      if (!used[i]) {
        open.push(i);
      }
    }
    return open[Math.floor(Math.random() * open.length)];
  }

  addChoice(word, index) {
    // private
    services.defservice.getDefinitions(this.language, word).then(
      function (defs) {
        if (defs.length) {
          this.choice[index] = defs.map((item) => item.x).slice(0, 3);
          defs.map((item) => (this.sources[item.s] = true));
          this.requestUpdate();
        } else {
          this.choice[index] = [
            "[error: missing definition for '" + word.word + "']"
          ];
          this.requestUpdate();
        }
      }.bind(this)
    );
  }

  finished() {
    if (this.correct()) {
      services.wordservice.saveWord(this.word).then((count) => {
        window.dispatchEvent(
          new CustomEvent("word-count", {
            detail: { language: this.language, count: count }
          })
        );
      });
    }
    this.dispatchEvent(new CustomEvent("complete", { detail: this.correct() }));
  }

  correct() {
    return this.answer == this.selected;
  }

  choose(evt) {
    if (this.selected == null) {
      // find choice on outer element
      let elem = evt.target;
      let choice = elem.dataset.choice;
      while (!choice) {
        elem = elem.parentElement;
        choice = elem.dataset.choice;
      }
      const index = parseInt(choice);
      this.selected = index;
      this.requestUpdate();
    }
  }
}

window.customElements.define("quiz-view", QuizView); // needed?
