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
import './source-info.js';

import {ContextConsumer} from '@lit/context';
import {html, LitElement} from 'lit-element';

import {servicectx} from '../service-context.js';
import {DefinitionService} from '../services/definition-service.js';

class DefPopup extends LitElement {

  static get properties() {
    return {
      language : {type : String},
      work : {type : String},
      word : {type : Object},
      defs : {type : Array},
      roots : {type : Array},
      visible : {type : Boolean}
    };
  }

  render() {
    return html`
      <style>
        #outer {
          background-color: #fafcd1;
          border-radius: 7px;
          box-shadow: 3px 3px 1px -3px rgba(0,0,0,0.15);
          padding: 15px;
          width: 55%;
          max-width: 300px;
          max-height: 55%;
          overflow: auto;
          position: absolute;
          right: 0;
          left: 0;
          top: 35%;
          margin-right: auto;
          margin-left: auto;
          visibility: ${this.visible ? "visible" : "hidden"};
        }
        h2 {
          margin-top: 5px
        }
      </style>
      <div id="outer" @click="${() => this.visible = false}">
        <h2>${this.defs[0].w}</h2>
        <ul>
        ${this.defs.map((def) => html`<li>${def.x}</li>`)}
        </ul>
        ${
        this.roots.length == 0 || this.roots[0].s !== this.defs[0].s ?
            html`<source-info source="${this.defs[0].s}"></source-info><br/>` :
            ``}
        ${
        this.roots.length ? html`<h2>${this.roots[0].w}</h2>
          <ul>
          ${this.roots.map((def) => html`<li>${def.x}</li>`)}
          </ul>
          <source-info source="${this.roots[0].s}"></source-info>` :
                            ``}
      </div>
    `;
  }

  constructor() {
    super();
    this.defs = [ {s : "qr"} ];
    this.roots = [];
    this.ctxconsumer = new ContextConsumer(this, {context : servicectx});
  }

  set word(value) {
    if(value) {
      const defservice = this.ctxconsumer.value.defservice;
      defservice.getDefinitions(this.language, value, this.work).then(function(defs) {
        this.defs = defs.length ? defs : [ {s : "qr"} ];
      }.bind(this));
      this.roots = [];
      if(value.root) {
        defservice.getDefinitions(this.language, {word : value.root, type : value.type}, this.work)
            .then(function(defs) {
              this.roots = defs;
            }.bind(this));
      }
      this.visible = true;
    }
  }
}

window.customElements.define('def-popup', DefPopup);
