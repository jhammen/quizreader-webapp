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

/**
 * service to lookup and store known words
 */
export class WordService {

  constructor(language, db) {
    this.lang = language;
    this.words = {};
    this.quizwords = {};
    this.store = db;
  }

  init() {
    return new Promise((resolve, reject) => {
      // load words into cache
      let count = 0;
      const tx = this.store.transaction([ "word" ], "readonly");
      const table = tx.objectStore("word");
      table.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if(cursor) {
          const word = cursor.value;
          this.typeCache(word.type)[word.word] = true;
          this.addQuizWord(word);
          cursor.continue();
          count++;
        } else {
          // end of entries
          window.dispatchEvent(new CustomEvent('word-count', {detail : {language : this.lang, count : count}}));
          resolve();
        }
      };
    });
  }

  randomWord(type, excludes) {
    const typed = this.quizwords[type];
    if(excludes.length >= typed.length) {
      return null;
    }
    let word = typed[Math.floor(Math.random() * typed.length)];
    while(excludes.indexOf(word) >= 0) {
      word = typed[Math.floor(Math.random() * typed.length)];
    }
    return {'word' : word, 'type' : type};
  }

  isKnown(word) {
    this.addQuizWord(word);
    return word.word in this.typeCache(word.type);
  }

  save(word) {
    return new Promise((resolve, reject) => {
      if(this.isKnown(word)) {
        resolve(0);
      } else {
        // open transaction
        const tx = this.store.transaction([ "word" ], "readwrite");

        // add request
        const table = tx.objectStore("word");
        const request = table.add(word);
        request.onerror = (event) => { reject("word service add request failed"); };

        // count request
        let count = 0;
        const countrequest = table.count();
        countrequest.onsuccess = (event) => { count = countrequest.result; };
        countrequest.onerror = (event) => { reject("word service count request failed"); };

        // resolve when tx complete
        tx.oncomplete = (event) => { // done
          this.typeCache(word.type)[word.word] = true;
          resolve(count)
        };
        tx.onerror = (event) => { reject("word service transaction failed"); };
      }
    });
  }

  getAll() {
    return new Promise(function(resolve, reject) {
      const ret = [];
      const table = this.store.transaction("word", "readonly").objectStore("word");
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

  addQuizWord(word) { // private
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
