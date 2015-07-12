'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { return Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _templatesMixinJs = require('./templates/mixin.js');

var _templatesMixinJs2 = _interopRequireDefault(_templatesMixinJs);

var sassUtils = require('node-sass-utils')(_nodeSass2['default']);

var sassport = function sassport(modules) {
  var renderer = arguments[1] === undefined ? _nodeSass2['default'] : arguments[1];

  if (!Array.isArray(modules)) {
    modules = [modules];
  }

  var sassportInstance = new Sassport(null, modules, renderer);

  return sassportInstance;
};

sassport.module = function (name) {
  return new Sassport(name);
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

    var result = unwrappedFunc.apply(undefined, args);

    return returnSass ? result : sassUtils.castToSass(result);
  };
};

sassport.asset = function (file, transformer) {
  var assetMeta = {
    url: file
  };

  if (transformer) {
    _lodash2['default'].merge(assetMeta, transformer.call(null, file));
  }

  // Quote strings
  assetMeta = _lodash2['default'].mapValues(assetMeta, function (value) {
    return _lodash2['default'].isString(value) ? '"' + value + '"' : value;
  });

  return assetMeta;
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

    this._default = {
      contents: []
    };

    this._mixins = {};

    var options = {
      functions: {},
      importer: [this._defaultImporter.bind(this)]
    };

    modules.map(function (module) {
      _lodash2['default'].merge(options, module.options);
    });

    this.options = options;
  }

  _createClass(Sassport, [{
    key: 'module',
    value: function module(name) {
      this.name = name;

      return this;
    }
  }, {
    key: 'render',
    value: function render(options, emitter) {
      _lodash2['default'].extend(this.options, options);

      return this.sass.render(this.options, emitter);
    }
  }, {
    key: 'renderSync',
    value: function renderSync(options, emitter) {
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

      if (arguments.length == 1) {
        exportMap = { 'default': arguments[0] };
      } else if (arguments.length == 2) {
        exportMap = _defineProperty({}, arguments[0], arguments[1]);
      }

      var _loop = function (path) {
        var exportUrl = '' + _this.name + '/' + path;
        var exportFile = exportMap[path];

        if (path === 'default') {
          _this._default.file = exportFile;

          return 'continue';
        }

        var importer = function importer(url, prev, done) {
          if (url == exportUrl) {
            done({ file: exportFile });
          }
        };

        _this.options.importer.push(importer);
      };

      for (var path in exportMap) {
        var _ret = _loop(path);

        if (_ret === 'continue') continue;
      }

      return this;
    }
  }, {
    key: '_defaultImporter',
    value: function _defaultImporter(url, prev, done) {
      if (url === this.name) {
        var importerData = {};

        if (this._default.file) {
          if (!this._default.contents.length) {
            importerData.file = this._default.file;
          } else {
            importerData.contents = _fs2['default'].readFileSync(this._default.file);
          }
        }

        if (this._default.contents.length) {
          console.log(this._default.contents);
          importerData.contents += this._default.contents.join('');
        }

        done(importerData);
      }
    }
  }, {
    key: 'variables',
    value: function variables(variableMap) {
      for (var key in variableMap) {
        var value = variableMap[key];
        var sassValue = sassUtils.sassString(sassUtils.castToSass(value));

        this._default.contents.push('' + key + ': ' + sassValue + ';');
      }

      return this;
    }
  }, {
    key: 'rulesets',
    value: function rulesets(_rulesets) {
      var _this2 = this;

      _rulesets.map((function (ruleset) {
        var renderedRuleset = _this2.sass.renderSync({ data: ruleset }).css.toString();

        _this2._default.contents.push(renderedRuleset);
      }).bind(this));

      return this;
    }
  }, {
    key: 'assets',
    value: function assets() {}
  }]);

  return Sassport;
})();

exports['default'] = sassport;
module.exports = exports['default'];