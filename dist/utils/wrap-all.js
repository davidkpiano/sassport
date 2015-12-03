'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _isFunction = require('lodash/lang/isFunction');

var _isFunction2 = _interopRequireDefault(_isFunction);

var _flatten = require('lodash/array/flatten');

var _flatten2 = _interopRequireDefault(_flatten);

var _defaults = require('lodash/object/defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _wrap = require('./wrap');

var _wrap2 = _interopRequireDefault(_wrap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var wrapAll = function wrapAll(collection) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  return (0, _wrap2.default)(function (key) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    var done = args.pop();
    var result = collection[key];

    if ((0, _isFunction2.default)(result)) {
      result = result.apply(collection, (0, _flatten2.default)(args));
    }

    return result;
  }, options);
};

exports.default = wrapAll;