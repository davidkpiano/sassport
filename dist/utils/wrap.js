'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

exports.default = function (unwrappedFunc) {
  var _this = this;

  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  options = (0, _defaults2.default)(options, {
    done: true,
    quotes: false,
    infer: true,
    unit: false
  });

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var outerDone = args.pop();
    var result = undefined;

    var innerDone = function innerDone(innerResult) {
      outerDone(_index2.default.toSass(innerResult, options));
    };

    var jsArgs = getJsValue(args);

    // Add 'done' callback if options.done is set true
    if (options.done) {
      jsArgs.push(innerDone);
    }

    result = unwrappedFunc.apply(_this, jsArgs);

    // Quote string if options.quotes is set true
    if (options.quotes && (0, _isString2.default)(result)) {
      result = '\'"' + result + '"\'';
    }

    if (typeof result !== 'undefined') {
      innerDone(result);
    }
  };
};

var _isString = require('lodash/lang/isString');

var _isString2 = _interopRequireDefault(_isString);

var _isArray = require('lodash/lang/isArray');

var _isArray2 = _interopRequireDefault(_isArray);

var _defaults = require('lodash/object/defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _index = require('./index');

var _index2 = _interopRequireDefault(_index);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function getJsValue(arg) {
  var result = _index2.default.castToJs(arg);

  if ((0, _isArray2.default)(result)) {
    return result.map(function (arg) {
      return getJsValue(arg);
    });
  }

  // Get unitless value from number
  if (result.hasOwnProperty('value')) {
    return result.value;
  }

  // Get simple get/set interface from map
  if (result.hasOwnProperty('coerce')) {
    return result.coerce;
  }

  return result;
}

;