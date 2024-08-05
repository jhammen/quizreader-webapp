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

import {SiteInfo} from '../site-info.js'

/**
 * indexedDB data store
 */
export class IDBStore {
	
  static CHAPTER = "chapter";

  init() {
    return new Promise((resolve, reject) => {
      const version = SiteInfo.version;
      const db = window.indexedDB.open('quizreader', version);
      db.addEventListener('error', (e) => reject(e));

      db.addEventListener('upgradeneeded', init => {
        const db = init.target.result;
        db.onerror = (e) => { reject(e); };
        //  word tables
        for(const lang in SiteInfo.languages) {
          const wordstore = db.createObjectStore('word-' + lang, {keyPath : [ 'word', 'type' ]});
        }
        // chapter table
        const chapstore = db.createObjectStore(IDBStore.CHAPTER, {keyPath : 'work'});
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
