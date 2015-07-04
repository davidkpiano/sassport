'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var sassUtils = require('node-sass-utils')(_nodeSass2['default']);

var sassport = function sassport(plugins) {
  var renderer = arguments[1] === undefined ? _nodeSass2['default'] : arguments[1];

  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }

  return new Renderer(plugins, renderer);
};

sassport.functions = function (funcMap) {
  var sassportInstance = new Sassport();

  return sassportInstance.functions(funcMap);
};

sassport.wrap = function (unwrappedFunc) {
  var returnSass = arguments[1] === undefined ? false : arguments[1];

  return function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    args = args.map(function (arg) {
      return sassUtils.castToJs(arg);
    });

    var result = unwrappedFunc.apply(undefined, _toConsumableArray(args));

    return returnSass ? result : sassUtils.castToSass(result);
  };
};

sassport.imports = function (importMap) {
  var sassportInstance = new Sassport();

  return sassportInstance.imports(importMap);
};

var Sassport = (function () {
  function Sassport() {
    _classCallCheck(this, Sassport);

    this.options = {
      functions: {}
    };
  }

  _createClass(Sassport, [{
    key: 'functions',
    value: function functions(_functions) {
      _lodash2['default'].extend(this.options.functions, _functions);

      return this;
    }
  }]);

  return Sassport;
})();

var Renderer = (function () {
  function Renderer(plugins, renderer) {
    if (plugins === undefined) plugins = [];

    _classCallCheck(this, Renderer);

    this.sass = renderer;

    this.options = {
      functions: {}
    };

    this._includeSassports(plugins);
  }

  _createClass(Renderer, [{
    key: 'render',
    value: function render(options, emitter) {
      _lodash2['default'].extend(options, this.options);

      return this.sass.render(options, emitter);
    }
  }, {
    key: '_includeSassports',
    value: function _includeSassports(plugins) {
      var _this = this;

      plugins.forEach(function (plugin) {
        _lodash2['default'].merge(_this.options, { functions: plugin.options.functions });
      }, this);
    }
  }]);

  return Renderer;
})();

exports['default'] = sassport;
module.exports = exports['default'];