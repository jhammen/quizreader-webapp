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

const SOURCE_QUIZREADER = "qr";
const SOURCE_WIKTIONARY = "wikt";

/**
 * service to look up definitions
 */
export class DefinitionService {
  constructor() {
    this.sources = {
      [SOURCE_QUIZREADER]: { "name": "quizreader.org" },
      [SOURCE_WIKTIONARY]: { "name": "wiktionary.org", "license": "CC BY-SA 3.0" }
    };
    // sources sorted by priority
    this.sourcelist = [SOURCE_QUIZREADER, SOURCE_WIKTIONARY];
  }

  init(language) {
    return new Promise((resolve, reject) => {
      fetch(language + "/txt/idx.json").then(response => response.json()).then(json => {
        for (let key in json) {
          this.sources[key] = { "name": json[key].title }
        }
        resolve();
      })
    })
  }

  /**
   * return a list of defintions for the given language, word and definition source
   */
  getDefinitions(language, word, source) {
    // copy the sourcelist and insert this source
    const sources = this.sourcelist.slice();
    if (source) {
      sources.unshift(source);
    }
    return fetch(this.#defPath(language, word.word))
      .then(function (response) {
        return response.json();
      })
      .then(
        function (json) {
          const ret = [];
          for (let source of sources) {
            if (json[source]) {
              for (let def of json[source]) {
                if (def.t === word.type) {
                  def.w = word.word;
                  def.s = source;
                  ret.push(def);
                }
              }
              if (ret.length) {
                return ret;
              }
            }
          }
          return ret;
        }.bind(this),
        function (error) {
          console.log("definition load", error);
          return [];
        }
      );
  }

  /**
   * return a list of defintions for the given language, word and definition source,
   * modified for usage in a quiz
   */
  getQuizDefinitions(language, word, source) {
    return new Promise((resolve, reject) => {
      this.getDefinitions(language, word, source).then((defs) => {
        let ret = [];
        defs.forEach((def) => {
          // check for offensive or unlikely glosses
          const checks = ["colloquial", "vulgar", "BDSM", "LGBT"];
          let pass = true;
          checks.forEach((str) => {
            if (def.x.includes(str)) {
              pass = false;
            }
          });
          if (pass) {
            const newdef = Object.assign({}, def);
            // remove initial non-gloss definitions in leading parenthesis
            newdef.x = def.x.replace(/^\([^\)]*\)\s*/, "");
            ret.push(newdef);
          }
        });
        // remove identical defs
        ret = ret.filter(
          (obj, i) => i === ret.findIndex((o) => o.t === obj.t && o.x === obj.x)
        );
        resolve(ret);
      });
    });
  }

  /** 
   * get information about a given source by key 
   */
  getSourceInfo(key) {
    return this.sources[key];
  }

  #defPath(language, word) {
    const dir = word.length < 2 ? word : word.substring(0, 2);
    return "/" + language + "/def/en/" + dir + "/" + word + ".json";
  }
}
