'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _nodeSassUtils = require('node-sass-utils');

var _nodeSassUtils2 = _interopRequireDefault(_nodeSassUtils);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var sassUtils = (0, _nodeSassUtils2['default'])(_nodeSass2['default']);

sassUtils.toSass = function (jsValue) {
  var infer = arguments.length <= 1 || arguments[1] === undefined ? USE_INFERENCE : arguments[1];

  if (infer && jsValue && !(typeof jsValue.toSass === 'function')) {
    // Infer Sass value from JS string value.
    if (_lodash2['default'].isString(jsValue)) {
      jsValue = sassUtils.infer(jsValue);

      // Check each item in array for inferable values.
    } else if (_lodash2['default'].isArray(jsValue)) {
        jsValue = _lodash2['default'].map(jsValue, function (item) {
          return sassUtils.toSass(item, infer);
        });

        // Check each value in object for inferable values.
      } else if (_lodash2['default'].isObject(jsValue)) {
          jsValue = _lodash2['default'].mapValues(jsValue, function (subval) {
            return sassUtils.toSass(subval, infer);
          });
        }
  }

  return sassUtils.castToSass(jsValue);
};

sassUtils.infer = function (jsValue) {
  var result = undefined;

  try {
    _nodeSass2['default'].renderSync({
      data: '$_: ___((' + jsValue + '));',
      functions: {
        '___($value)': function ___$value(value) {
          result = value;

          return value;
        }
      }
    });
  } catch (e) {
    return jsValue;
  }

  return result;
};

/**
 * Collection of utilities from 'node-sass-utils'.
 * @type {Object}
 */
exports['default'] = sassUtils;
module.exports = exports['default'];