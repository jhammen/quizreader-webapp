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
        db.createObjectStore(this.#storename(QRDatabase.STORE_CHAPTER), {
          keyPath: "work"
        });
        db.createObjectStore(this.#storename(QRDatabase.STORE_PARAGRAPH), {
          keyPath: ["work", "chapter"]
        });
        //  word tables
        db.createObjectStore(this.#storename(QRDatabase.STORE_WORD), {
          keyPath: ["word", "type"]
        });

        db.onerror = (e) => {
          this.#errorevent(e);
          reject(e);
        };
      });

      // on success save db reference and call promise resolve()
      request.addEventListener("success", () => {
        this.db = request.result;
        resolve(this);
      });

      // on error call promise reject()
      request.addEventListener("error", (e) => {
        this.#errorevent(e);
        reject(e)
      });
    });
  }

  delete() {
    return new Promise((resolve, reject) => {
      const request = window.indexedDB.deleteDatabase("quizreader-" + this.language);
      request.onsuccess = () => resolve();
      request.onerror = (e) => reject(e);
    });
  }

  //  get a single value by key
  get(type, key) {
    return new Promise((resolve, reject) => {
      try {
        const storename = this.#storename(type);
        const tx = this.db.transaction([storename]);
        const store = tx.objectStore(storename);
        const request = store.get(key);
        request.onsuccess = () => {
          resolve(request.result);
        };
        request.onerror = (e) => {
          this.#errorevent(e);
          reject(e);
        };
      } catch (ex) {
        this.#errorevent(ex);
        reject(ex);
      }
    });
  }

  // get all records for a given store
  getAll(type) {
    return new Promise((resolve, reject) => {
      try {
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
        request.onerror = (evt) => {
          this.#errorevent(evt);
          reject(evt);
        }
      }
      catch (ex) {
        this.#errorevent(ex);
        reject(ex);
      }
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
        this.#errorevent(evt);
        reject(evt);
      };
      // resolve when tx complete
      tx.oncomplete = (evt) => {
        resolve();
      };
      tx.onerror = (evt) => {
        this.#errorevent(evt);
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
        this.#errorevent(event);
        reject(event);
      };

      // request to count entries
      const countRequest = store.count();
      let count = 0;
      countRequest.onsuccess = (event) => {
        count = countRequest.result;
      };
      countRequest.onerror = (event) => {
        this.#errorevent(event);
        reject(event);
      };

      // resolve when tx complete
      tx.oncomplete = (event) => {
        resolve(count);
      };
      tx.onerror = (event) => {
        this.#errorevent(event);
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
        this.#errorevent();
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

  #errorevent(evt) {
    window.dispatchEvent(new CustomEvent("db-error", { detail: evt, bubbles: true, composed: true }));
  }
}
