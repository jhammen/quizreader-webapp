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
 * indexedDB data store
 */
export class IDBStore {

  constructor(lang) {
    this.language = lang;
  }

  init() {
    return new Promise((resolve, reject) => {
      const db = window.indexedDB.open('qrdb-' + this.language, 1);
      db.addEventListener('error', (e) => reject(e));

      db.addEventListener('upgradeneeded', init => {
        const db = init.target.result;
        db.onerror = () => { console.error('Error loading database.'); };
        //  word table
        const wordstore = db.createObjectStore('word', {keyPath : [ 'word', 'type' ]});
        // chapter table
        const chapstore = db.createObjectStore('chapter', {keyPath : 'work'});
        chapstore.createIndex("chapter", "chapter", {unique : false});
      });

      db.addEventListener('success', () => {
        this.db = db.result;
        resolve(this.db);
      });
    });
  }

  transaction(stores, mode) {
    return this.db.transaction(stores, mode); // eg: [ "words" ], "readwrite"
  }
}
