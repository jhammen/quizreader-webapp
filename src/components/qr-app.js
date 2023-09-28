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
import './app-link.js';
import './lang-list.js';
import './read-view.js';
import './title-list.js';
import './title-toc.js';
import './vocab-list.js';
import './qr-router.js';

import {html, LitElement} from 'lit-element';

function ife(field, def = "") {
  return field ? field : def
}

class QrApp extends LitElement {

  static get properties() {
    return {
      // URL segment properties
      language : {type : String},
      command : {type : String},
      work : {type : String},    // id of the current title
      chapter : {type : String}, // id of current chapter
      statpath : {type : String}
    };
  }

  constructor() {
    super();
    this.views = {};
    window.onpopstate = function() {
      this.route(location.hash.substring(1));
    }.bind(this);
    window.addEventListener('link', (e) => { this.redirect(e.detail); });
    window.addEventListener('word-count', (e) => { this.count(e.detail); });
    this.language = "";
    this.work = "";
    this.chapter = "";
  }

  firstUpdated(props) {
    super.firstUpdated(props);
    this.route(location.hash.substring(1));
  }

  findView(name) {
    if(!this.views[name]) {
      this.views[name] = document.createElement(name);
    }
    return this.views[name];
  }

  redirect(dest) {
    history.pushState({}, "", "#" + dest);
    this.route(dest);
  }

  route(dest) {
    const [, lang, command, work, chapter] = dest.split("/");
    this.language = ife(lang);
    this.command = ife(command, "home");
    this.work = ife(work);
    this.chapter = ife(chapter);
    // console.log("routing", this.language, this.command, this.work, this.chapter);
  }

  render() {
    return html`
            <style>
            :host {
              font-family: sans-serif;
            }
            .bubble {
              background-color: #ffffff;
              border-radius: 7px;
              box-shadow: 10px 10px 5px -10px rgba(0,0,0,0.25);
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
              max-width: 700px;
            }           
            #content {
				min-height: 300px;
			}
            .statcounter { display: none; }
            </style>
            <div class="outer">
            <div class="bubble navbar">
              <app-link href='/' text='Home'></app-link>
              <app-link href='/${this.language}/titles' text='Titles' ?inactive="${!this.language}"></app-link>
              <app-link href='/${this.language}/toc/${this.work}' text='Contents' ?inactive="${!this.work}"></app-link>
              <app-link href='/${this.language}/vocab/${this.work}' text='Vocab' ?inactive="${
    !this.language}"></app-link>
              ${
        this.language ?
        html`<span class="rightside">&nbsp;0000</span>              
              	<img height="20" width="30" class="rightside" visible="hidden" src="${this.language}/flag.png"/>` :
        ""}
            </div>
            <div id="content" class="bubble">
            <qr-router page="${this.command}">
              <div slot="home">
                <lang-list></lang-list>
              </div>
              <div slot="titles">
                <title-list language="${this.language}" chapter="${this.chapter}"></title-list>
              </div>
              <div slot="toc">
                <title-toc language="${this.language}" work="${this.work}"></title-toc>
              </div>
              <div slot="read">
                <read-view language="${this.language}" work="${this.work}" chapter="${this.chapter}"
                    @chapter-complete="${this.nextChapter}" @work-complete="${this.showTitles}"></read-view>
              </div>
              <div slot="vocab">
                <vocab-view language="${this.language}" work="${this.work}" chapter="${this.chapter}"></vocab-view>
              </div>
            </qr-router>
          </div>
          <img class="statcounter" src="${this.statpath}">
          </div>`;
  }

  count(c) {
    console.log('word count', c)
  }

  nextChapter(evt) {
    const next = evt.detail;
    this.redirect("/" + this.language + "/read/" + this.work + "/" + next);
  }

  showTitles() {
    this.redirect(`/${this.language}/titles`);
  }
}

customElements.define('qr-app', QrApp);
