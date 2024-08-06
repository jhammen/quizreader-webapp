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
 * service to lookup and store bookmark locations
 */
export class BookmarkService {

  constructor(db) {
    this.db = db;
    this.chapters = {}; // cache
  }

  init() {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction(IDBStore.CHAPTER);
      const store = tx.objectStore(IDBStore.CHAPTER);

      store.openCursor().onsuccess = (event) => {
        const cursor = event.target.result;
        if(cursor) {
          const chapter = cursor.value;
          cursor.continue();
        } else {
          // end of entries
          resolve();
        }
      };
    });
  }

  chapter(work) {
    return new Promise((resolve, reject) => {
      if(work in this.chapters) {
        resolve(this.chapters[work]);
      } else {
        // seek from db
        const transaction = this.db.transaction([ IDBStore.CHAPTER ]);
        const objectStore = transaction.objectStore(IDBStore.CHAPTER);
        const request = objectStore.get(work);
        request.onerror = (e) => { reject(e); };
        request.onsuccess = (e) => {
          if(request.result) {
            resolve(request.result.chapter);
          } else {
            resolve(0);
          }
        };
      }
    });
  }
  
  paragraph(work, chapter) {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([ IDBStore.PARAGRAPH ]);
      const objectStore = transaction.objectStore(IDBStore.PARAGRAPH);
      const request = objectStore.get([work, chapter]);
      request.onerror = (e) => { reject(e); };
      request.onsuccess = (e) => {
        if(request.result) {
          resolve(request.result.paragraph);
        } else {
          resolve(0);
        }
      };
    });
  }

  saveChapter(work, chapter) {
    return new Promise((resolve, reject) => {
      // open transaction
      const tx = this.db.transaction([ IDBStore.CHAPTER ], "readwrite");

      // add request
      const table = tx.objectStore(IDBStore.CHAPTER);
      const request = table.put({work : work, chapter : chapter});
      request.onerror = (event) => { reject("bookmark service save chapter request failed"); };

      // resolve when tx complete
      tx.oncomplete = (event) => {
        // save to cache
        this.chapters[work] = chapter;
        resolve();
      };
      tx.onerror = (event) => { reject("word service transaction failed"); };
    });
  }

  saveParagraph(work, chapter, paragraph) {
    return new Promise((resolve, reject) => {
      // open transaction
      const tx = this.db.transaction([ IDBStore.PARAGRAPH ], "readwrite");

      // add request
      const table = tx.objectStore(IDBStore.PARAGRAPH);
      const request = table.put({work : work, chapter : chapter, paragraph: paragraph});
      request.onerror = (event) => { reject("bookmark service save paragraph request failed"); };

      // resolve when tx complete
      tx.oncomplete = (event) => { resolve(); };
      tx.onerror = (event) => { reject("word service transaction failed"); };
    });
  }
  
  remove(work) {
    return new Promise((resolve, reject) => {
      const tx = this.db.transaction([ IDBStore.CHAPTER ], "readwrite");
      const request = tx.objectStore(IDBStore.CHAPTER).delete(work);
      request.onerror = (e) => { reject(e); };
      request.onsuccess = (event) => {
        delete this.chapters[work];
        resolve();
      };
    });
  }
}
