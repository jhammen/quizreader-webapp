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
import "./app-link.js";

import { html, LitElement } from "lit-element";

import { SiteInfo } from "../site-info.js";

class LangList extends LitElement {
  render() {
    return html`
      <style>
        a {
          color: #5555ff;
          cursor: pointer;
        }
      </style>
      <div>
        <h2>Available Languages</h2>
        <ul>
          ${Object.keys(this.languages).map(
            (i) =>
              html`<li>
                <img height="20" width="30" src="${i}/flag.png" />
                <app-link
                  href="/${i}/titles"
                  text="${this.languages[i]}"
                ></app-link>
              </li>`
          )}
        </ul>
      </div>
    `;
  }

  constructor() {
    super();
    this.languages = SiteInfo.languages;
  }
}
window.customElements.define("lang-list", LangList);
