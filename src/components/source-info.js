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
import { LitElement, html } from "lit-element";

class SourceInfo extends LitElement {
  static get properties() {
    return {
      source: String,
      label: String,
      info: Object,
    };
  }

  render() {
    return html` <style>
        .source {
          font-size: 9pt;
        }
        .source a {
          font-size: 7pt;
          text-decoration: none;
        }
      </style>
      ${this.info
        ? html`<div class="source">
            ${this.label}: <i>${this.info.name}</i>
            <a href="${this.info.llink}">${this.info.license}</a>
          </div>`
        : ``}`;
  }

  constructor() {
    super();
    this.label = "source";
    this.info = {};
    // TODO: move mapping to external file
    this.data = {
      qr: {
        name: "quizreader.org",
        license: "CC BY-NC-SA 4.0",
        llink: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
      },
      wikt: {
        name: "wiktionary.org",
        license: "CC BY-SA 3.0",
        llink: "https://creativecommons.org/licenses/by-sa/3.0/",
      },
    };
  }

  set source(value) {
    if (value) {
      this.info = this.data[value];
    }
  }
}

window.customElements.define("source-info", SourceInfo);
