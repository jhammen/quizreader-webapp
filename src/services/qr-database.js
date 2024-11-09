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

import { SiteInfo } from "../site-info.js";

/**
 * indexedDB data store
 */
export class QRDatabase {
  static STORE_CHAPTER = "chapter";
  static STORE_PARAGRAPH = "paragraph";
  static STORE_WORD = "word";

  constructor(lang) {
    this.language = lang;
  }

  // define object stores and indices
  init() {
    return new Promise((resolve, reject) => {
      // get database version from site info
      const version = SiteInfo.version;

      // open database for the given language
      const request = window.indexedDB.open(
        "quizreader-" + this.language,
        version
      );

      // on upgradeneeded create stores
      request.addEventListener("upgradeneeded", (init) => {
        const db = init.target.result;

        // bookmark stores: chapter + paragraph
        db.createObjectStore(this.language + "-" + QRDatabase.STORE_CHAPTER, {
          keyPath: "work"
        });
        db.createObjectStore(this.language + "-" + QRDatabase.STORE_PARAGRAPH, {
          keyPath: ["work", "chapter"]
        });
        //  word tables
        db.createObjectStore(this.language + "-" + QRDatabase.STORE_WORD, {
          keyPath: ["word", "type"]
        });

        db.onerror = (e) => {
          reject(e);
        };
      });

      // on success save db reference and call promise resolve()
      request.addEventListener("success", () => {
        this.db = request.result;
        resolve(this);
      });

      // on error call promise reject()
      request.addEventListener("error", (e) => reject(e));
    });
  }

  //  get a single value by key
  get(type, key) {
    return new Promise((resolve, reject) => {
      const storename = this.#storename(type);
      const tx = this.db.transaction([storename]);
      const store = tx.objectStore(storename);
      const request = store.get(key);
      request.onsuccess = () => {
        resolve(request.result);
      };
      request.onerror = (e) => {
        reject(e);
      };
    });
  }

  // get all records for a given store
  getAll(type) {
    return new Promise((resolve, reject) => {
      const storename = this.#storename(type);
      const store = this.db.transaction([storename]).objectStore(storename);
      const request = store.openCursor();
      const list = [];
      request.onsuccess = (evt) => {
        const cursor = evt.target.result;
        if (cursor) {
          list.push(cursor.value);
          cursor.continue();
        } else {
          resolve(list);
        }
      };
      request.onerror = (evt) => reject(evt);
    });
  }

  // save a single value to a store
  save(type, value) {
    const storename = this.#storename(type);
    return new Promise((resolve, reject) => {
      // open transaction
      const tx = this.db.transaction([storename], "readwrite");
      // add request
      const store = tx.objectStore(storename);
      const request = store.put(value);
      request.onerror = (evt) => {
        reject(evt);
      };
      // resolve when tx complete
      tx.oncomplete = (evt) => {
        resolve();
      };
      tx.onerror = (evt) => {
        reject(evt);
      };
    });
  }

  // save a value to a store and return the total count
  saveAndCount(type, value) {
    const storename = this.#storename(type);
    return new Promise((resolve, reject) => {
      // open transaction
      const tx = this.db.transaction([storename], "readwrite");

      // request to add entry
      const store = tx.objectStore(storename);
      const request = store.add(value);
      request.onerror = (event) => {
        reject(event);
      };

      // request to count entries
      const countRequest = store.count();
      let count = 0;
      countRequest.onsuccess = (event) => {
        count = countRequest.result;
      };
      countRequest.onerror = (event) => {
        reject(event);
      };

      // resolve when tx complete
      tx.oncomplete = (event) => {
        resolve(count);
      };
      tx.onerror = (event) => {
        reject(event);
      };
    });
  }

  remove(type, obj) {
    return new Promise((resolve, reject) => {
      const storename = this.#storename(type);
      const tx = this.db.transaction([storename], "readwrite");
      const request = tx.objectStore(storename).delete(obj);
      request.onerror = (event) => {
        reject(event);
      };
      request.onsuccess = (event) => {
        resolve();
      };
    });
  }

  #storename(type) {
    return this.language + "-" + type;
  }
}
