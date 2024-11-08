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

import { services } from "../services.js";

class SourceInfo extends LitElement {
  static properties = {
    source: String,
    label: String,
    info: Object
  }

  constructor() {
    super();
    this.label = "source";
    this.info = {};
    this.licenseLink = {
      "CC BY-NC-SA 4.0": "https://creativecommons.org/licenses/by-nc-sa/4.0/",
      "CC BY-SA 3.0": "https://creativecommons.org/licenses/by-sa/3.0/"
    }
  }

  get source() {
    return this._source;
  }

  set source(value) {
    if (value) {
      this.info = services.defservice.getSourceInfo(value);
    }
    this._source = value;
  }

  render() {
    return this.info ? this.#renderSource() : ``;
  }

  #renderSource() {
    return html`<style>
      .source {
        font-size: 9pt;
      }
      .source a {
        font-size: 7pt;
        text-decoration: none;
      }
    </style>   
        <div class="source">
          source: <i>${this.info.name}</i>
          ${this.info.license ? html`<a href="${this.licenseLink[this.info.license]}">${this.info.license}</a>` : ``}
        </div>
        `;
  }
}

window.customElements.define("source-info", SourceInfo);
