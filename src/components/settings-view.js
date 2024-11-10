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

class SettingsView extends LitElement {
  static properties = { language: { type: String } };

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
     // read se from storage
    }
  }
    
  render() {
    return html`
      <style>
        .tile {
          position: relative;
          float: left;
          width: 50%;
        }
        .tilecontent {
          border: 2px solid #888888;
          border-radius: 15px;
          margin: 10px;
          padding: 10px;
        }
        .control {
          width: 50px;
          float: right;          
        }
        @media only screen and (max-width: 800px) {
          .tile {
            width: 100%;
          }
        }
      </style>
      <div>
        <h2>Settings</h2>
        <div>
          <div class="tile">
          <div class="tilecontent">
            Max quiz words per paragraph:
             <input type="number" class="control"/>
            </div>
          </div>
          <div class="tile">
          <div class="tilecontent">
            Export Word List:
            <button class="control" @click="${this.export}">Export</button>
            </div>
          </div>          
          <div class="tile">
          <div class="tilecontent">
            Import Word List: 
            <button class="control">Import</button>
            </div>
          </div>          
        </div>
      </div>
    `;
  }
}

window.customElements.define("settings-view", SettingsView);
