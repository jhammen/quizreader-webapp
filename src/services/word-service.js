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

import {IDBStore} from './idb-store.js';

class WordCache {

  words = {};
  quizwords = {};
  count = 0;

  addQuizWord(word) {
    const type = word.type
    if(!this.quizwords[type]) {
      this.quizwords[type] = [ word.word ];
    }
    else if(this.quizwords[type].indexOf(word.word) < 0) {
      this.quizwords[type].push(word.word);
    }
    // console.log("ADD ", word, this.quizwords)
  }
  typeCache(type) { // private
    if(!this.words.hasOwnProperty(type)) {
      this.words[type] = {};
    }
    return this.words[type];
  }
}

/**
 * service to lookup and store known words
 */
export class WordService {

  constructor(db) {
    this.store = db;
    this.cache = {};
  }

  init(language) {
    return new Promise((resolve, reject) => {
      if(this.cache[language]) {
        resolve(this.cache[language].count);
      } else {
        const cache = new WordCache();
        // load words into cache
        const storename = "word-" + language;
        const tx = this.store.transaction([ storename ], "readonly");
        const store = tx.objectStore(storename);
        const request = store.openCursor();
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if(cursor) {
            const word = cursor.value;
            cache.typeCache(word.type)[word.word] = true;
            cache.addQuizWord(word);
            cursor.continue();
            cache.count++;
          } else {
            // end of entries
            this.cache[language] = cache;
            resolve(cache.count);
          }
        };
        request.onfailure = (e) => reject(e);
      }
    });
  }

  randomWord(language, type, excludes) {
    const typed = this.cache[language].quizwords[type];
    if(excludes.length >= typed.length) {
      return null;
    }
    let word = typed[Math.floor(Math.random() * typed.length)];
    while(excludes.indexOf(word) >= 0) {
      word = typed[Math.floor(Math.random() * typed.length)];
    }
    return {'word' : word, 'type' : type};
  }

  isKnown(language, word) {
    const cache = this.cache[language];
    cache.addQuizWord(word);
    return word.word in cache.typeCache(word.type);
  }

  save(language, word) {
    return new Promise((resolve, reject) => {
      if(this.isKnown(language, word)) {
        resolve(0);
      } else {
        // open transaction
        const storename = "word-" + language;
        const tx = this.store.transaction([ storename ], "readwrite");

        // add request
        const table = tx.objectStore(storename);
        const request = table.add(word);
        request.onerror = (event) => { reject("word service add request failed"); };

        // count request
        let count = 0;
        const countrequest = table.count();
        countrequest.onsuccess = (event) => { count = countrequest.result; };
        countrequest.onerror = (event) => { reject("word service count request failed"); };

        const cache = this.cache[language];
        // resolve when tx complete
        tx.oncomplete = (event) => { // done
          cache.typeCache(word.type)[word.word] = true;
          resolve(count)
        };
        tx.onerror = (event) => { reject("word service transaction failed"); };
      }
    });
  }

  getAll(language) {
    return new Promise(function(resolve, reject) {
      const ret = [];
      const storename = "word-" + language;
      const table = this.store.transaction(storename, "readonly").objectStore(storename);
      table.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if(cursor) {
          ret.push(cursor.value);
          cursor.continue();
        } else {
          resolve(ret);
        }
      };
    }.bind(this));
  }
}
