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

class TitleToc extends LitElement {

  static get properties() {
    return {
      language: String,
      work: String,
      title: String,
      files: Array
    };
  }

  render() {
    return html `
      <div>
        <h2>Contents</h2>
        <ul>
        ${this.files.map((val, i) =>
          html`<li><app-link href="/${this.language}/read/${this.title}/${i+1}" text="${val}"></app-link></li>`)}
        </ul>
      </div>
    `;
  }

  constructor() {
    super();
    this.files = [];
  }

  get language() { return this._language; }

  set language(value) {
    this._language = value;
  }

  set work(value) {
    if (value) {
      const title = value.split('/')[0];
      if (title != this.title) {
        this.title = title;
        fetch(this.language + '/txt/' + this.title + '/toc.json')
          .then(function (response) { return response.json(); })
          .then(function (json) {
            this.files = json;
          }.bind(this));
      }
    }
  }

}

window.customElements.define('title-toc', TitleToc);