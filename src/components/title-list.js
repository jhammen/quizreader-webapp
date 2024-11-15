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

class TitleList extends LitElement {
  static properties = { language: { type: String } };

  render() {
    return html`
      <style>
        #flow {
          overflow: hidden;
        }
        .tile {
          position: relative;
          float: left;
          width: 50%;
          height: 300px;
        }
        .tilecontent {
          border: 2px solid #888888;
          border-radius: 15px;
          height: 90%;
          width: 90%;
          margin: 3%;
          padding: 1.5%;
        }
        .linkdiv {
          height: 10%;
          display: flex;
          justify-content: center;
          align-items: center;
          text-align: center;
        }
        .imgdiv {
          height: 80%;
          display: flex;
          justify-content: center;
        }
        .cover {
          max-height: 100%;
          max-width: 100%;
        }
        @media only screen and (max-width: 600px) {
          .tile {
            width: 100%;
          }
        }
      </style>
      <div>
        <h2>Available Titles</h2>
        <div id="flow">
          ${this.titles.map(
            (item) =>
              html`<div class="tile">
                <div class="tilecontent">
                  <div class="linkdiv">
                    <app-link
                      href="/${this.language}/read/${item.path}"
                      text="${item.obj.title}"></app-link>
                  </div>
                  <div class="linkdiv">
                    <app-link
                      href="/${this.language}/read/${item.path}"
                      text="${item.obj.author}"
                    ></app-link>
                  </div>
                  <div class="imgdiv">
                    <img
                      class="cover"
                      src="/${this.language}/txt/${item.path}/img/cover.jpg"
                    />
                  </div>
                </div>
              </div>`
          )}
        </div>
      </div>
    `;
  }

  constructor() {
    super();
    this.language = "";
    this.titles = [];
  }

  get language() {
    return this._language;
  }

  set language(value) {
    if (value) {
      fetch(value + "/txt/idx.json")
        .then(function (response) {
          return response.json();
        })
        .then(
          function (json) {
            const titles = [];
            for (const path in json) {
              titles.push({
                path: path,
                obj: json[path]
              });
            }
            this.titles = titles;
            const oldValue = this._language;
            this._language = value;
            this.requestUpdate("language", oldValue);
          }.bind(this)
        );
    }
  }
}

window.customElements.define("title-list", TitleList);
