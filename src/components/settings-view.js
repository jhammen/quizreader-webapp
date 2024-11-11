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

import { services } from "../services.js";

class SettingsView extends LitElement {
  static properties = {
    language: { type: String },
    importerror: { state: true },
    importmesg: { state: true }
  };

  get language() {
    return this._language;
  }

  set language(value) {
    this._language = value;
    if (value) {
      // read se from storage
    }
  }

  export() {
    const date = new Date();
    let filename = "quizreader-" + this.language + "-" + date.getFullYear();
    filename += "-" + date.getMonth() + "-" + date.getDay() + ".json";
    services.wordservice.allWords().then(
      (result) => {
        // file data as object
        const filedata = {}
        filedata.l = this.language;
        filedata.d = (new Date()).toISOString();
        filedata.v = 1; // version
        // add words to file object
        filedata.w = []
        for (const obj of result) {
          filedata.w.push({ w: obj.word, t: obj.type })
        }
        // create json and export
        const jsondata = JSON.stringify(filedata, null, 2);
        const exportLink = document.createElement('a');
        exportLink.href = URL.createObjectURL(new Blob([jsondata], { type: 'application/json' }));
        exportLink.download = filename;
        exportLink.click();
      }
    );
  }

  import(evt) {
    // get uploaded file metadata
    const file = evt.target.files[0];
    // test file type
    this.importerror = null;
    if (!file.type.startsWith('application/json')) {
      this.importerror = "import upload should be a json file";
      return;
    }
    // read incoming file
    const reader = new FileReader();
    reader.onload = (fevt) => {
      const contents = fevt.target.result;
      try {
        const data = JSON.parse(contents);
        if (data.l != this.language) {
          this.importerror = "wrong language: " + data.l;
          return;
        }
        const words = []
        for (const entry of data.w) {
          words.push({ word: entry.w, type: entry.t });
        }
        services.wordservice.saveWords(words).then(
          (count) => {
            this.importmesg = "imported " + data.w.length + " entries";
            window.dispatchEvent(
              new CustomEvent("word-count", {
                detail: { language: this.language, count: count }
              })
            );
          },
          (e) => {
            this.importerror = e;
            console.error(e);
          }
        )
      } catch (e) {
        this.importerror = e;
        console.error(e);
      }
    };
    reader.readAsText(file);
  }

  render() {
    return html`
      <style>
        .tile {
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
        .error {
          font-family: monospace;
          color: red;
        }
        .mesg {
          font-family: monospace;
          color: blue;
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
             <input type="number" min="0" max="999" value="5" class="control"/>
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
            <p>
              <span class="error">${this.importerror}</span>
              <span class="mesg">${this.importmesg}</span>
            </p>
            <input @change="${this.import}" type="file"/>
            </div>
          </div>    
        </div>
      </div>
    `;
  }
}

window.customElements.define("settings-view", SettingsView);
