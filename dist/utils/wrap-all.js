'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _lodashLangIsFunction = require('lodash/lang/isFunction');

var _lodashLangIsFunction2 = _interopRequireDefault(_lodashLangIsFunction);

var _lodashArrayFlatten = require('lodash/array/flatten');

var _lodashArrayFlatten2 = _interopRequireDefault(_lodashArrayFlatten);

var _lodashObjectDefaults = require('lodash/object/defaults');

var _lodashObjectDefaults2 = _interopRequireDefault(_lodashObjectDefaults);

var _wrap = require('./wrap');

var _wrap2 = _interopRequireDefault(_wrap);

var wrapAll = function wrapAll(collection) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return (0, _wrap2['default'])(function (key) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var done = args.pop();
    var result = collection[key];

    if ((0, _lodashLangIsFunction2['default'])(result)) {
      result = result.apply(collection, (0, _lodashArrayFlatten2['default'])(args));
    }

    return result;
  }, options);
};

exports['default'] = wrapAll;
module.exports = exports['default'];