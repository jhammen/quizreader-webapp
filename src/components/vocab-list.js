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
import "./def-popup.js";
import "./text-view.js";

import { html, LitElement } from "lit-element";

import { services } from "../services.js";

class VocabView extends LitElement {
  static get properties() {
    return {
      language: { type: String },
      active: { type: Boolean },
      words: { type: Array },
      defword: { state: true }
    };
  }
  render() {
    return html`
      <style>
        #scroller {
          height: calc(100vh - 155px);
          overflow: auto;
        }
        .A {
          border: 1px solid grey;
          background: #fffae9;
        }
        .C {
          border: 1px solid grey;
          background: #f0dde1;
        }
        .D {
          border: 1px solid grey;
          background: #fffae9;
        }
        .N {
          border: 1px solid grey;
          background: #ddf2fe;
        }
        .O {
          border: 1px solid grey;
          background: #efeef0;
        }
        .P {
          border: 1px solid grey;
          background: #f0dde1;
        }
        .T {
          border: 1px solid grey;
          background: #fffae9;
        }
        .V {
          border: 1px solid grey;
          background: #ddfff1;
        }
      </style>
      <div id="scroller">
        <h2>Vocab</h2>
        <h3>${this.words.length} entries</h3>
        <div>
          ${this.words.map(
            (item) =>
              html`<a
                class="${item.type}"
                @click="${() => (this.defword = item)}"
                >${item.word}</a
              > `
          )}
        </div>
        <def-popup
          language="${this.language}"
          .word="${this.defword}"
          @closed=${() => {
            this.defword = null;
          }}
        ></def-popup>
      </div>
    `;
  }

  constructor() {
    super();
    this.words = [];
    this.defword = null;
  }

  get active() {
    return this._active;
  }
  set active(active) {
    if (active && this.language) {
      this.refresh();
    }
    this._active = active;
  }

  refresh() {
    services.wordservice.allWords().then(
      function (result) {
        this.words = result;
        this.words.sort(this.comparator);
      }.bind(this)
    );
  }

  comparator(word1, word2) {
    return word1.word > word2.word;
  }
}

window.customElements.define("vocab-view", VocabView);
