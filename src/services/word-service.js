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

import { QRDatabase } from "./qr-database";

/**
 * service to lookup and store known words
 */
export class WordService {
  #knownwords = {};
  #quizwords = {};

  constructor(db) {
    this.db = db;
  }

  init(language) {
    return new Promise((resolve, reject) => {
      this.db.getAll(QRDatabase.STORE_WORD).then(
        (allwords) => {
          // loop over all known words from db
          let count = 0;
          for (const word in allwords) {
            // add to local cache of known words
            this.#addKnownWord(word);
            // add to pool of quiz words
            this.#addQuizWord(word);
            count++;
          }
          // add seed words as quiz words
          fetch(language + "/def/seed.json")
            .then((response) => response.json())
            .then(
              (json) => {
                json.forEach((seed) => {
                  this.#addQuizWord({ word: seed.w, type: seed.t });
                });
                resolve(count);
              },
              () => resolve(count) // error loading seeds: resolve promise anyway
            );
        },
        (evt) => reject(evt)
      );
    });
  }

  // return all known words from db
  allWords() {
    return this.db.getAll(QRDatabase.STORE_WORD);
  }

  // return a random quiz word of a given type
  randomWord(type, excludes) {
    const typeSet = this.#quizwords[type];
    const options = typeSet.difference(new Set(excludes));
    if (!options.size) {
      // should not happen if seed words loaded correctly
      return null;
    }
    const token = Array(...options)[Math.floor(Math.random() * options.size)];
    return { word: token, type: type };
  }

  // check if word is known
  isKnown(word) {
    this.#addQuizWord(word); // add to quiz pool either way
    return word.word in this.#typeMap(word.type);
  }

  // set a word as known and save in database
  // returns count of all known words
  saveWord(word) {
    return new Promise((resolve, reject) => {
      if (this.isKnown(word)) {
        resolve(0);
      } else {
        this.db.saveAndCount(QRDatabase.STORE_WORD, word).then(
          (count) => {
            this.#typeMap(word.type)[word.word] = true;
            resolve(count);
          },
          (evt) => reject(evt)
        );
      }
    });
  }

  // add a word as known
  #addKnownWord(word) {
    this.#typeMap(word.type)[word.word] = true;
  }

  // add a word to the pool for quizzes (may not be known)
  #addQuizWord(word) {
    const type = word.type;
    if (!this.#quizwords[type]) {
      this.#quizwords[type] = new Set();
    }
    this.#quizwords[type].add(word.word);
  }

  // get hash of known words by type
  #typeMap(type) {
    if (!this.#knownwords[type]) {
      this.#knownwords[type] = {};
    }
    return this.#knownwords[type];
  }
}
