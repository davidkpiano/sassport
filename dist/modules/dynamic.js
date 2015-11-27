'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _indexJs = require('../index.js');

var _indexJs2 = _interopRequireDefault(_indexJs);

var dynamicModule = _indexJs2['default'].module('dynamic').loaders({
  'dynamic': function dynamic(content, meta) {}
});

exports['default'] = dynamicModule;
module.exports = exports['default'];