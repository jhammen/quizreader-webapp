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

class MoreButton extends LitElement {

  render() {
    return html `
      <style>
      button {
        background-color: #5555FF;
        border: none;
        color: #FFFFFF;
        padding: 12px 16px;
        font-size: 16px;
      }
      button:hover {
        background-color: #7777FF;
        cursor: pointer;
      }
      </style>
      <button>&gt;</button>
    `;
  }
}

window.customElements.define('more-button', MoreButton);