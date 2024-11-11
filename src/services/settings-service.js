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


const KEY_MAX_QUIZWORDS = "qr.max.quizwords.";

/**
 * service to store app settings
 */
export class SettingsService {

  constructor(lang) {
    this.language = lang;
  }

  getWordsPerQuiz() {
    const maxwords = localStorage.getItem(KEY_MAX_QUIZWORDS + this.language);
    return maxwords ? maxwords : 5;
  }

  setWordsPerQuiz(value) {
    localStorage.setItem(KEY_MAX_QUIZWORDS + this.language, value);
  }
}
