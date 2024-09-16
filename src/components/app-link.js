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
import { LitElement, html } from "lit-element";

class AppLink extends LitElement {
  static get properties() {
    return {
      href: { type: String },
      text: { type: String },
      inactive: { type: Boolean }
    };
  }

  render() {
    return this.inactive
      ? html`<style>
            span {
              color: #bbbbbb;
            }</style
          ><span>${this.text}</span>`
      : html`<style>
            a {
              color: #5555ff;
              cursor: pointer;
            }</style
          ><a @click="${this.click}">${this.text}</a>`;
  }

  click() {
    window.dispatchEvent(new CustomEvent("link", { detail: this.href }));
  }
}

window.customElements.define("app-link", AppLink);
