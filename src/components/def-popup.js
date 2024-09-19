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
import "./source-info.js";

import { html, LitElement } from "lit-element";

import { services } from "../services.js";

class DefPopup extends LitElement {
  static get properties() {
    return {
      language: { type: String },
      work: { type: String },
      word: { type: Object },
      defs: { type: Array },
      roots: { type: Array },
      visible: { type: Boolean }
    };
  }

  constructor() {
    super();
    this.defs = [{ s: "qr" }];
    this.roots = [];
    // bind context so these methods can be referenced in removeEventListener
    this.dragMove = this.dragMove.bind(this);
    this.dragStop = this.dragStop.bind(this);
  }

  dragStart(e) {
    const elem = e.target.parentElement;
    // store information about current drag
    this.drag = { elem: elem, x: e.clientX, y: e.clientY };
    // add top limit to disallow dragging above the viewport
    // not zero but half the current height due to the 50% transform
    this.drag.ylimit = parseInt(window.getComputedStyle(elem).height) / 2;
    // initialize left value to its current computed value
    elem.style.left = window.getComputedStyle(elem).left;
    // add event handlers
    document.addEventListener("mousemove", this.dragMove);
    document.addEventListener("mouseup", this.dragStop);
  }

  dragMove(e) {
    // compute and set new top/left for outer div
    const drag = this.drag;
    const newx = drag.elem.offsetLeft - drag.x + e.clientX;
    const newy = Math.max(
      drag.elem.offsetTop - drag.y + e.clientY,
      drag.ylimit
    );
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.elem.style.left = newx + "px";
    drag.elem.style.top = newy + "px";
  }

  dragStop(e) {
    // remove drag-related mouse events
    document.removeEventListener("mousemove", this.dragMove);
    document.removeEventListener("mouseup", this.dragStop);
  }

  render() {
    return html`
      <style>
        #outer {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 55%;
          max-width: 300px;
          max-height: 55%;
          background-color: #fafcd1;
          border-radius: 15px;
          box-shadow: 3px 3px 1px -3px rgba(0, 0, 0, 0.15);
          visibility: ${this.visible ? "visible" : "hidden"};
          display: flex;
          flex-direction: column;
        }
        #header {
          border-bottom: 1px solid #bbbbbb;
          padding-right: 10px;
        }
        #content {
          padding: 0px 15px 10px 15px;
          overflow: auto;
        }
        #close-button {
          font-weight: bold;
          font-size: 175%;
          cursor: pointer;
          float: right;
        }
        h2 {
          margin-top: 5px;
        }
      </style>
      <div id="outer">
        <div id="header" @mousedown="${this.dragStart}">
          <a
            id="close-button"
            title="Close"
            @click="${() => (this.visible = false)}"
            >&times;</a
          >
        </div>
        <div id="content">
          <h2>${this.defs[0].w}</h2>
          <ul>
            ${this.defs.map((def) => html`<li>${def.x}</li>`)}
          </ul>
          ${this.roots.length == 0 || this.roots[0].s !== this.defs[0].s
            ? html`<source-info source="${this.defs[0].s}"></source-info>`
            : ``}
          ${this.roots.length
            ? html`<h2>${this.roots[0].w}</h2>
                <ul>
                  ${this.roots.map((def) => html`<li>${def.x}</li>`)}
                </ul>
                <source-info source="${this.roots[0].s}"></source-info>`
            : ``}
        </div>
      </div>
    `;
  }

  set word(value) {
    if (value) {
      const defservice = services.defservice;
      defservice
        .getDefinitions(this.language, value, this.work)
        .then((defs) => {
          this.defs = defs.length ? defs : [{ s: "qr" }];
        });
      this.roots = [];
      if (value.root) {
        defservice
          .getDefinitions(
            this.language,
            { word: value.root, type: value.type },
            this.work
          )
          .then((defs) => {
            this.roots = defs;
          });
      }
      this.visible = true;
    }
  }
}

window.customElements.define("def-popup", DefPopup);
