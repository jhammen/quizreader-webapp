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
import "./text-view.js";
import "./quiz-view.js";

import { html, LitElement } from "lit-element";

class ReadView extends LitElement {
  static get properties() {
    return {
      language: { type: String },
      location: { type: String },
      mode: { type: String },
      quizword: { type: Object },
    };
  }

  render() {
    return html`
      <qr-router page="${this.mode}">
        <div slot="quiz">
          <quiz-view
            language="${this.language}"
            word="${this.quizword}"
            @complete="${this.quizAnswer}"
          >
          </quiz-view>
        </div>
        <div slot="read">
          <text-view
            id="text"
            language="${this.language}"
            location="${this.location}"
            @new-words="${this.startQuiz}"
          >
          </text-view>
        </div>
      </qr-router>
    `;
  }

  constructor() {
    super();
    this.init();
  }

  get location() {
    return this._location;
  }

  set location(value) {
    this.init(); // refresh view for a new location
    this._location = value;
  }

  quizMode(b) {
    this.mode = b ? "quiz" : "read";
  }

  nextWord() {
    return JSON.stringify(this.words.pop());
  }

  startQuiz(evt) {
    if (evt.detail.length) {
      this.words = evt.detail;
      // shuffle
      for (var i = this.words.length - 1; i > 0; i--) {
        var pick = Math.floor(Math.random() * (i + 1));
        var orig = this.words[i];
        this.words[i] = this.words[pick];
        this.words[pick] = orig;
      }
      this.quizword = this.nextWord();
      this.quizMode(true);
    } else {
      this.quizMode(false);
    }
  }

  quizAnswer(evt) {
    const success = evt.detail;
    if (this.words.length > 0) {
      this.quizword = this.nextWord();
    } else {
      this.quizMode(false);
    }
  }

  init() {
    // private
    this.quizword = "";
    this.quizMode(false);
    this.words = [];
  }
}

window.customElements.define("read-view", ReadView);
