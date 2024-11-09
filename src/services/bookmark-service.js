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
 * service to lookup and store bookmark locations
 */
export class BookmarkService {
  constructor(db) {
    this.db = db;
    this.chapters = {}; // cache
  }

  chapter(work) {
    return new Promise((resolve, reject) => {
      if (work in this.chapters) {
        resolve(this.chapters[work]);
      } else {
        // get from db
        this.db.get(QRDatabase.STORE_CHAPTER, work).then(
          (result) => resolve(result ? result.chapter : 0),
          (evt) => reject(evt)
        );
      }
    });
  }

  paragraph(work, chapter) {
    return new Promise((resolve, reject) => {
      this.db.get(QRDatabase.STORE_PARAGRAPH, [work, chapter]).then(
        (result) => resolve(result ? result.paragraph : 0),
        (evt) => reject(evt)
      );
    });
  }

  saveChapter(work, chapter) {
    return new Promise((resolve, reject) => {
      this.db
        .save(QRDatabase.STORE_CHAPTER, { work: work, chapter: chapter })
        .then(
          () => {
            this.chapters[work] = chapter;
            resolve();
          },
          evt => reject(evt)
        );
    });
  }

  saveParagraph(work, chapter, paragraph) {
    return this.db.save(QRDatabase.STORE_PARAGRAPH, {
      work: work,
      chapter: chapter,
      paragraph: paragraph
    });
  }

  remove(work) {
    return new Promise((resolve, reject) => {
      this.db.remove(QRDatabase.STORE_CHAPTER, work).then(
        () => {
          delete this.chapters[work];
          resolve();
        },
        e => reject(e)
      )
    });
  }
}
