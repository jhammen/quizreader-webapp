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

import {WordService} from '../services/word-service.js';

import {IDBStore} from './idb-store.js';

// module-scoped instance map
let services = {};

/**
 * factory for service objects
 */
export class ServiceFactory {

  constructor(language) {
    this.lang = language;
  }

  init() {
    return new Promise((resolve, reject) => {
      const store = new IDBStore(this.lang);
      // open database
      store.init().then((db) => {
        // open services
        this.words = new WordService(this.lang, db);
        this.words.init().then(() => resolve());
      }, (e) => reject(e));
    });
  }

  wordService() {
    return this.words;
  }

  static instance(language) {
    if(!services[language]) {
      services[language] = new ServiceFactory(language);
    }
    return services[language];
  }
}
