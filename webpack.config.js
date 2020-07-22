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
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const LicenseCheckerWebpackPlugin = require("license-checker-webpack-plugin");

module.exports = {
  entry: {
    app: './src/index.js'
  },
  mode: 'development',
  devServer: {
    contentBase: './',
    hot: true,
    historyApiFallback: true
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyWebpackPlugin([
      './src/jslicense.html'
    ]),
    new HtmlWebpackPlugin({
      title: 'Quiz Reader',
      template: './src/index.html'
    }),
    new webpack.HotModuleReplacementPlugin(),
    new LicenseCheckerWebpackPlugin()
  ]
};