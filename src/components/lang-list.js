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
import { LitElement, html } from 'lit-element';
import './app-link.js';
import { WordService } from '../services/word-service.js';

class LangList extends LitElement {

  static get properties() {
    return {
      languages: Array
    };
  }

  render() {
    return html `
      <style>a {color: #5555FF; cursor: pointer;}</style>
      <div>
        <h2>Available Languages</h2>
        <ul>
        ${Object.keys(this.languages).map(i =>
          html`<li><img height="20" width="30" src="${i}/flag.png"> <a data-code="${i}" @click="${this.click}">${this.languages[i]}</a></li>`)}
        </ul>
      </div>
    `;
  }

  constructor() {
    super();
    this.languages = [];
    fetch("/sites.json")
    .then(function (response) { return response.json(); })
    .then(function (json) {
    	console.log(json);
    	this.languages = json;
    }.bind(this));
  }

  click(evt) {
    const code = evt.target.dataset.code;
    WordService.instance(code).loadWordlist('/' + code + '/def/hifrq.json')
      .then(function () {
        window.dispatchEvent(new CustomEvent('link', { detail: `/${code}/titles` }));
      });
    evt.preventDefault();
  }

}

window.customElements.define('lang-list', LangList);