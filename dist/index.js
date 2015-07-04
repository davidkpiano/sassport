'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var sassport = function sassport(imports) {
  if (!Array.isArray(imports)) {
    imports = [imports];
  }

  return new Renderer(imports);
};

sassport.functions = function (funcMap) {
  var sassportInstance = new Sassport();

  return sassportInstance.functions(funcMap);
};

sassport.plain = function (pureFunc) {
  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    for (var i = 0; i < args.length; i++) {
      args[i] = convertSassValue(args[i]);
    }

    var result = pureFunc.apply(undefined, args);

    return inferPlainValue(result);
  };
};

var inferPlainValue = function inferPlainValue(value) {
  if (value === null || value === undefined) {
    return _nodeSass2['default'].types.Null.NULL;
  }

  if (_lodash2['default'].isString(value)) {
    return _nodeSass2['default'].types.String(value);
  }

  if (_lodash2['default'].isNumber(value)) {
    return _nodeSass2['default'].types.Number(value);
  }

  if (_lodash2['default'].isBoolean(value)) {
    return value ? _nodeSass2['default'].types.Boolean.TRUE : _nodeSass2['default'].types.boolean.FALSE;
  }

  if (_lodash2['default'].isArray(value)) {
    var _length = value.length;
    var result = _nodeSass2['default'].types.List(_length);

    for (var i = 0; i < _length; i++) {
      result = result.setValue(i, inferPlainValue(value[i]));
    }

    return result;
  }

  if (_lodash2['default'].isObject(value)) {
    if (value instanceof Map) {
      var result = _nodeSass2['default'].types.Map(value.size());

      var keys = value.keys();

      for (var i = 0; i < keys.length; i++) {
        var key = inferPlainValue(key);
        var val = value.getValue(key);

        result.setValue(key, val);
      }

      return result;
    }
  }
};

var convertSassValue = function convertSassValue(value) {
  if (!value.getR && !value.getValue) {
    return null;
  }

  if (value.getKey) {
    var _length2 = value.getLength();
    var result = new Map();

    for (var i = 0; i < _length2; i++) {
      var key = value.getKey(i);
      var val = value.getValue(i);

      result.set(convertSassValue(key), convertSassValue(val));
    }

    return result;
  }

  if (value.getLength) {
    var _length3 = value.getLength();
    var result = [];

    for (var i = 0; i < _length3; i++) {
      result.push(value.getValue(i));
    }

    return result.map(function (item) {
      return convertSassValue(item);
    });
  }

  if (value.getR) {
    return {
      r: value.getR(),
      g: value.getG(),
      b: value.getB(),
      a: value.getA()
    };
  }

  return value.getValue();
};

var Sassport = (function () {
  function Sassport() {
    _classCallCheck(this, Sassport);

    this.options = {};
  }

  _createClass(Sassport, [{
    key: 'functions',
    value: function functions(funcMap) {
      _lodash2['default'].extend(this.options, funcMap);

      return this.options;
    }
  }]);

  return Sassport;
})();

var Renderer = (function () {
  function Renderer() {
    var sassports = arguments[0] === undefined ? [] : arguments[0];

    _classCallCheck(this, Renderer);

    this.options = {};
    this.functions = {};

    this._includeSassports(sassports);
  }

  _createClass(Renderer, [{
    key: '_includeSassports',
    value: function _includeSassports(sassports) {
      var _this = this;

      sassports.forEach(function (sassport) {
        var functions = sassport.functions;

        _lodash2['default'].extend(_this, functions);
      }, this);
    }
  }]);

  return Renderer;
})();

exports['default'] = sassport;
module.exports = exports['default'];