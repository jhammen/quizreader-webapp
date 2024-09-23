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
import "./lang-list.js";
import "./read-view.js";
import "./title-list.js";
import "./title-toc.js";
import "./vocab-list.js";
import "./qr-router.js";

import { html, LitElement } from "lit-element";

import { services } from "../services.js";
import { BookmarkService } from "../services/bookmark-service.js";
import { DefinitionService } from "../services/definition-service.js";
import { QRDatabase } from "../services/qr-database.js";
import { WordService } from "../services/word-service.js";

const EMPTY_STRING = "";
function ife(field, def = EMPTY_STRING) {
  return field ? field : def;
}

class QrApp extends LitElement {
  static get properties() {
    return {
      // URL segment properties
      language: { type: String }, // current language
      command: { type: String }, // command = page to show
      arg: { type: String } // url argument for command
    };
  }

  constructor() {
    super();
    this.language = EMPTY_STRING;
    this.command = EMPTY_STRING;
    this.arg = EMPTY_STRING;
    // hash word counts by language
    this.wordcount = {};
    // pop state = routing for back button
    window.onpopstate = () => {
      this.route(location.hash.substring(1));
    };
    // custom event for  app links
    window.addEventListener("link", (e) => {
      this.redirect(e.detail);
    });
    // custom event to update word count display
    window.addEventListener("word-count", (e) => {
      this.updateCount(e.detail);
    });
  }

  firstUpdated(props) {
    super.firstUpdated(props);
    this.route(location.hash.substring(1));
  }

  redirect(dest) {
    // push new state to history
    history.pushState({}, "", "#" + dest);
    // fire custom event for site statistics
    const event = new CustomEvent("pagechange", { detail: dest });
    window.dispatchEvent(event);
    // route to new destination
    this.route(dest);
  }

  route(dest) {
    // parse destination url into component parts
    const [, lang, command, arg] = dest.split("/", 4);
    // is this a new language?
    if (lang && lang != this.language) {
      // open database for this language
      const db = new QRDatabase(lang);
      db.init().then(
        (qrdb) => {
          // create services for this language
          services.bkmkservice = new BookmarkService(qrdb);
          services.defservice = new DefinitionService(qrdb);
          services.wordservice = new WordService(qrdb);
          services.wordservice.init().then(
            (count) => {
              // show the word count for this language
              this.updateCount({ language: lang, count: count });
              this.go(command, lang, arg);
            },
            (e) => console.log("Error initializing WordService", e)
          );
        },
        (e) => console.log("Error opening IDBStore", e)
      );
    } else {
      this.go(command, lang, arg);
    }
  }

  // update active properties to show a new page
  go(command, lang, arg) {
    // console.log("CMD", command, lang, arg);
    this.language = ife(lang);
    this.command = ife(command, "home");
    this.arg = ife(arg);
  }

  render() {
    return html` <style>
        :host {
          font-family: sans-serif;
        }
        .bubble {
          background-color: #ffffff;
          border-radius: 7px;
          box-shadow: 10px 10px 5px -10px rgba(0, 0, 0, 0.25);
          margin: 10px;
          padding: 17px;
        }
        .navbar {
          font-weight: bold;
        }
        .rightside {
          float: right;
        }
        .outer {
          margin-left: auto;
          margin-right: auto;
          max-width: 800px;
        }
        #content {
          min-height: 300px;
        }
      </style>
      <div class="outer">
        <div class="bubble navbar">
          <app-link href="/" text="Home"></app-link>
          <app-link
            href="/${this.language}/titles"
            text="Titles"
            ?inactive="${!this.language}"
          ></app-link>
          <app-link
            href="/${this.language}/toc/${this.arg}"
            text="Contents"
            ?inactive="${!this.arg}"
          ></app-link>
          ${this.language
            ? html`<span class="rightside"
                  >&nbsp;
                  <app-link
                    href="/${this.language}/vocab/${this.work}"
                    text="${this.wordcount[this.language]}"
                  ></app-link
                ></span>
                <img
                  height="20"
                  width="30"
                  class="rightside"
                  visible="hidden"
                  src="${this.language}/flag.png"
                />`
            : ""}
        </div>
        <div id="content" class="bubble">
          <qr-router page="${this.command}">
            <div slot="home">
              <lang-list></lang-list>
            </div>
            <div slot="titles">
              <title-list language="${this.language}"></title-list>
            </div>
            <div slot="toc">
              <title-toc
                language="${this.language}"
                location="${this.arg}"
              ></title-toc>
            </div>
            <div slot="read">
              <read-view
                language="${this.language}"
                location="${this.arg}"
                @work-complete="${this.showTitles}"
              ></read-view>
            </div>
            <div slot="vocab">
              <vocab-view
                language="${this.language}"
                ?active="${this.command === "vocab"}"
              ></vocab-view>
            </div>
          </qr-router>
        </div>
      </div>`;
  }

  // update the total word count display
  updateCount(data) {
    this.wordcount[data.language] = String(data.count).padStart(4, "0");
    this.requestUpdate();
  }

  // show titles page after finished reading a title
  showTitles() {
    this.redirect(`/${this.language}/titles`);
  }
}

customElements.define("qr-app", QrApp);
