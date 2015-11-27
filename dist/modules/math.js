'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _indexJs = require('../index.js');

var _indexJs2 = _interopRequireDefault(_indexJs);

var mathModule = _indexJs2['default'].module('math').functions({
  'Math($method, $args...)': _indexJs2['default'].wrapAll(Math)
});

exports['default'] = mathModule;
module.exports = exports['default'];