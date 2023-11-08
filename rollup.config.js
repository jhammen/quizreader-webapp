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
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import html from '@web/rollup-plugin-html';

export default {

  plugins:
      [
        html({
          input : './index.html',
        }),
        resolve(), // resolve bare module specifiers
        terser({ecma : 2021, module : true, warnings : true})
        //  copy({
        //  copy static assets
        //   patterns : [ 'img/**/*' ],
        // }),
      ],

  output: {dir: 'build'},

  preserveEntrySignatures: 'strict'
};