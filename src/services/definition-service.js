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

/**
 * service to look up definitions
 */
export class DefinitionService {
  constructor() {
    // sources sorted by priority
    this.sources = ["qr", "wikt"]; // TODO: add current title
  }

  getDefinitions(language, word, source) {
    const sources = this.sources.slice();
    if (source) {
      sources.unshift(source);
    }
    return fetch(this.defPath(language, word.word))
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

  defPath(language, word) {
    const dir = word.length < 2 ? word : word.substring(0, 2);
    return "/" + language + "/def/en/" + dir + "/" + word + ".json";
  }
}
