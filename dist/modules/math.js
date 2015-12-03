'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _index = require('../index.js');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var mathModule = _index2.default.module('math').functions({
  'Math($method, $args...)': _index2.default.wrapAll(Math)
});

exports.default = mathModule;