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
  static get properties() {
    return { language: { type: String }, titles: Array };
  }

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
          height: 20%;
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
                      text="${item.name}"
                    ></app-link>
                  </div>
                  <div class="imgdiv">
                    <img
                      class="cover"
                      src="/${this.language}/txt/${item.path}/img/cover.jpg"
                    />
                  </div>
                </div>
              </div>`,
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
    return this._lang;
  }

  set language(value) {
    if (value) {
      const oldValue = this._lang;
      this._lang = value;
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
                name: json[path],
                chapter: this.bookmark(path),
              });
              this.titles = titles;
            }
          }.bind(this),
        );
      this.requestUpdate("language", oldValue);
    }
  }

  // TODO: unused
  refresh() {
    for (const title of this.titles) {
      title.chapter = this.bookmark(title.path);
    }
    this.requestUpdate();
  }

  bookmark(path) {
    // look up existing bookmark
    const data = localStorage.getItem("bkmk-" + path);
    return data ? data : 0;
  }
}

window.customElements.define("title-list", TitleList);
