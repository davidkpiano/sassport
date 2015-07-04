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

var ROOT = 'root';

var sassport = function sassport(modules) {
  var renderer = arguments[1] === undefined ? _nodeSass2['default'] : arguments[1];

  if (!Array.isArray(modules)) {
    modules = [modules];
  }

  var sassportInstance = new Sassport(ROOT, modules, renderer);

  return sassportInstance;
};

sassport.module = function (name) {
  var modules = arguments[1] === undefined ? [] : arguments[1];

  return new Sassport(name, modules);
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

sassport.utils = sassUtils;

var Sassport = (function () {
  function Sassport(name) {
    var modules = arguments[1] === undefined ? [] : arguments[1];
    var renderer = arguments[2] === undefined ? _nodeSass2['default'] : arguments[2];

    _classCallCheck(this, Sassport);

    this.name = name;
    this.modules = modules;
    this.sass = renderer;

    var options = {
      functions: {},
      importer: []
    };

    modules.map(function (module) {
      _lodash2['default'].merge(options, module.options);
    });

    this.options = options;
  }

  _createClass(Sassport, [{
    key: 'render',
    value: function render(options, emitter) {
      _lodash2['default'].extend(this.options, options);

      return this.sass.render(this.options, emitter);
    }
  }, {
    key: 'functions',
    value: function functions(functionMap) {
      _lodash2['default'].extend(this.options.functions, functionMap);

      return this;
    }
  }, {
    key: 'exports',
    value: function exports(exportMap) {
      var _this = this;

      var _loop = function (path) {
        var exportUrl = '' + _this.name;
        var exportFile = exportMap[path];

        if (path !== 'default') {
          exportUrl += '/' + path;
        }

        var importer = function importer(url, prev, done) {
          console.log(url, prev);

          if (url == exportUrl) {
            done({ file: exportFile });
          }
        };

        _this.options.importer.push(importer);
      };

      for (var path in exportMap) {
        _loop(path);
      }

      return this;
    }
  }]);

  return Sassport;
})();

exports['default'] = sassport;
module.exports = exports['default'];