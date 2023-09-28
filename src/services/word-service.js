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
    this.words = {};
    this.quizwords = {};

    const openOrCreateDB = window.indexedDB.open('qrdb-' + language, 1);
    // TODO: return promise, load on splash screen
    openOrCreateDB.addEventListener('error', () => console.error('Error opening DB'));

    openOrCreateDB.addEventListener('upgradeneeded', init => {
      const db = init.target.result;
      db.onerror = () => { console.error('Error loading database.'); };
      const table = db.createObjectStore('words', {keyPath : [ 'word', 'type' ]});
    });

    openOrCreateDB.addEventListener('success', () => {
      this.db = openOrCreateDB.result;
      // load words into cache
      let count = 0;
      const store = this.db.transaction("words").objectStore("words");
      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if(cursor) {
          const word = cursor.value;
          this.typeCache(word.type)[word.word] = true;
          this.addQuizWord(word);
          cursor.continue();
          count++;
        } else {
          // end of entries
          console.log("word load complete for " + language, count);
        }
      };
    });
  }

  randomWord(type) {
    const typed = this.quizwords[type];
    // console.log("quizword type " + type, this.quizwords[type])
    if(typed.length < 2) {
      return null;
    }
    const word = typed[Math.floor(Math.random() * typed.length)];
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
        const tx = this.db.transaction([ "words" ], "readwrite");

        // add request
        const store = tx.objectStore("words");
        const request = store.add(word);
        request.onerror = (event) => { reject("word service add request failed"); };

        // count request
        let count = 0;
        const countrequest = store.count();
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
      if(!this.db) {
        resolve([]);
      } else {
        const ret = [];
        const store = this.db.transaction("words").objectStore("words");
        store.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;
          if(cursor) {
            ret.push(cursor.value);
            cursor.continue();
          } else {
            resolve(ret);
          }
        };
      }
    }.bind(this));
  }

  addQuizWord(word) { // private
    const type = word.type
    if(!this.quizwords[type]) {
      this.quizwords[type] = [ word.word ];
    }
    else if(!(word.word in this.quizwords[type])) {
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

  static instance(language) {
    if(!services[language]) {
      services[language] = new WordService(language);
    }
    return services[language];
  }
}
