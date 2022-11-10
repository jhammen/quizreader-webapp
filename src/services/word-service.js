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

// module-scoped instance map
let services = {};

/**
 * service to lookup and store known words
 */
export class WordService {
  constructor(language) {
    this.lang = language;
    const data = localStorage.getItem("knownWords-" + this.lang);
    this.knownWords = data ? JSON.parse(data) : [];
  }

  isKnown(word) {
    return this.knownWords.some(item => this.matches(item, word));
  }

  matches(word1, word2) {
    return word1.word === word2.word && word1.type === word2.type;
  }

  add(word) {
    this.knownWords.push(word);
    this.save();
  }

  getAll() {
    return this.knownWords.slice(0);
  }

  randomWord(type) {
    const typed = this.knownWords.filter(item => item.type === type);
    return typed[Math.floor(Math.random() * Math.floor(typed.length))];
  }

  save() {
    localStorage.setItem('knownWords-' + this.lang, JSON.stringify(this.knownWords));
  }

  // TODO: remove if unused
  loadWordlist(path) {
    return fetch(path)
      .then(function (response) { return response.json(); })
      .then(function (json) {
        const items = json.map(item => new Object({ word: item.w, type: item.t }));
        this.knownWords = this.knownWords.concat(items.filter(item => !this.isKnown(item)));
        this.save();
        return json;
      }.bind(this));
  }

  static instance(language) {
    if (!services[language]) {
      services[language] = new WordService(language);
    }
    return services[language];
  }
}