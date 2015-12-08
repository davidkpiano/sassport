'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var imported = [];

var sassportOnce = _index2.default.module('once').loaders({
  'once': function once(contents, meta, done) {
    if (imported.indexOf(meta.absPath) !== -1) {
      return { contents: '' };
    }

    imported.push(meta.absPath);

    return { file: meta.absPath };
  }
});

exports.default = sassportOnce;