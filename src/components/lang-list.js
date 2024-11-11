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
          color: #ffc400;
          cursor: pointer;
        }
        #subhead {
          font-weight: bold;
        }
        .note {
          color:  #9c2b2e;
          border: 2px solid #888888;
          border-radius: 15px;
          padding: 10px;
        }
      </style>
      <div>
        <h2>Welcome to Quizreader!</h2>
        <p id="subhead">
          Quizreader is a free website for foreign language learning.
        </p>
        <p>
          As you read the site will quiz you on new words. 
          By reading and taking the quizzes you can build a
          personal vocabulary list.
        </p>
        <p>Please choose the language you want to learn:</p>
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
          <li><img height="20" width="30" src="fr/flag.png" /> French (coming soon)</li>
        </ul>
        <p class="note">
          ⚠️ Quizreader is a work in progress. You are welcome to test it but the texts are not yet complete
          and you may lose your progress as we continue to develop the site. Thank you.
        </p>
      </div>
    `;
  }

  constructor() {
    super();
    this.languages = SiteInfo.languages;
  }
}
window.customElements.define("lang-list", LangList);
