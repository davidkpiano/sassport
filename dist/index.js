'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _ncp = require('ncp');

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var sassUtils = require('node-sass-utils')(_nodeSass2['default']);

var sassport = function sassport() {
  var modules = arguments[0] === undefined ? [] : arguments[0];
  var renderer = arguments[1] === undefined ? _nodeSass2['default'] : arguments[1];

  if (!Array.isArray(modules)) {
    modules = [modules];
  }

  var sassportInstance = new Sassport(null, modules, renderer);

  return sassportInstance;
};

sassport.utils = sassUtils;

sassport.module = function (name) {
  return new Sassport(name);
};

sassport.wrap = function (unwrappedFunc) {
  var options = arguments[1] === undefined ? {} : arguments[1];

  return (function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var outerDone = args.pop();

    var innerDone = function innerDone(result) {
      outerDone(options.returnSass ? result : sassUtils.castToSass(result));
    };

    args = args.map(function (arg) {
      return sassUtils.castToJs(arg);
    });

    var result = unwrappedFunc.apply(undefined, _toConsumableArray(args).concat([innerDone]));

    if (typeof result !== 'undefined') {
      innerDone(result);
    }
  }).bind(this);
};

var Sassport = (function () {
  function Sassport(name) {
    var _this = this;

    var modules = arguments[1] === undefined ? [] : arguments[1];
    var renderer = arguments[2] === undefined ? _nodeSass2['default'] : arguments[2];

    _classCallCheck(this, Sassport);

    this.name = name;
    this.modules = modules;
    this.sass = renderer;

    this._exportMeta = {
      contents: []
    };

    this._exports = {};

    this._mixins = {};

    this._localPath = _path2['default'].resolve('./');
    this._localAssetPath = null;
    this._remoteAssetPath = null;

    this.options = {
      functions: {
        'asset-url($source, $module: null)': (function (source, module) {
          var modulePath = sassUtils.isNull(module) ? '' : module.getValue();
          var assetPath = source.getValue();
          var assetUrl = 'url(' + _path2['default'].join(this._remoteAssetPath, modulePath, assetPath) + ')';

          return _nodeSass2['default'].types.String(assetUrl);
        }).bind(this),
        'require($path, $propPath: null)': (function (file, propPath, done) {
          file = file.getValue();
          propPath = sassUtils.isNull(propPath) ? false : propPath.getValue();

          var data = require(_path2['default'].resolve(this._localPath, file));

          console.log(data);

          if (propPath) {
            data = _lodash2['default'].get(data, propPath);
          }

          return sassUtils.castToSass(data);
        }).bind(this)
      },
      importer: this._importer,
      sassportModules: modules // carried over to node-sass
    };

    this.modules.map(function (module) {
      _lodash2['default'].merge(_this.options, module.options);
    });
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

      this.options.importer = this._importer;

      return this.sass.render(this.options, emitter);
    }
  }, {
    key: 'renderSync',
    value: function renderSync(options, emitter) {
      _lodash2['default'].extend(this.options, options);

      return this.sass.renderSync(this.options, emitter);
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
      for (var exportKey in exportMap) {
        var exportPath = exportMap[exportKey];
        var exportMeta = {
          file: null,
          directory: null,
          content: null
        };

        if (_fs2['default'].lstatSync(exportPath).isDirectory()) {
          exportMeta.directory = exportPath;

          delete exportMeta.file;
        } else {
          exportMeta.file = exportPath;
        }

        this._exports[exportKey] = exportMeta;
      }

      return this;
    }
  }, {
    key: 'getLocalAssetPath',
    value: function getLocalAssetPath() {
      return this._localAssetPath;
    }
  }, {
    key: '_importer',
    value: function _importer(url, prev, done) {
      var _url$split = url.split('/');

      var _url$split2 = _toArray(_url$split);

      var moduleName = _url$split2[0];

      var moduleImports = _url$split2.slice(1);

      var module = null;
      var importerData = {
        contents: ''
      };
      var exportMeta = undefined;

      module = _lodash2['default'].find(this.options.sassportModules, function (childModule) {
        return childModule.name === moduleName;
      });

      if (!module) return prev;

      exportMeta = module._exportMeta;

      if (moduleImports.length) {
        exportMeta = module._exports[moduleImports[0]];
      }

      if (exportMeta.file) {
        if (!exportMeta.contents || !exportMeta.contents.length) {
          importerData.file = exportMeta.file;

          delete importerData.contents;
        } else {
          importerData.contents = _fs2['default'].readFileSync(exportMeta.file);
        }
      }

      if (exportMeta.contents && exportMeta.contents.length) {
        importerData.contents += exportMeta.contents.join('');
      }

      if (exportMeta.directory) {
        (function () {
          var assetDirPath = _path2['default'].join(module._localAssetPath, moduleName, moduleImports[0]);

          (0, _mkdirp2['default'])(assetDirPath, function (err, res) {
            if (err) console.error(err);

            (0, _ncp.ncp)(exportMeta.directory, assetDirPath, function (err, res) {
              done(importerData);
            });
          });
        })();
      } else {
        done(importerData);
      }
    }
  }, {
    key: 'variables',
    value: function variables(variableMap) {
      for (var key in variableMap) {
        var value = variableMap[key];
        var sassValue = sassUtils.sassString(sassUtils.castToSass(value));

        this._exportMeta.contents.push(key + ': ' + sassValue + ';');
      }

      return this;
    }
  }, {
    key: 'rulesets',
    value: function rulesets(_rulesets) {
      var _this2 = this;

      _rulesets.map((function (ruleset) {
        var renderedRuleset = _this2.sass.renderSync({ data: ruleset }).css.toString();

        _this2._exportMeta.contents.push(renderedRuleset);
      }).bind(this));

      return this;
    }
  }, {
    key: 'assets',
    value: function assets(localPath) {
      var _this3 = this;

      var remotePath = arguments[1] === undefined ? null : arguments[1];

      this._localPath = localPath;
      this._localAssetPath = _path2['default'].join(localPath, 'sassport-assets');
      this._remoteAssetPath = remotePath;

      _mkdirp2['default'].sync(this._localAssetPath);

      this.modules.map(function (module) {
        module._localPath = _this3._localPath;
        module._localAssetPath = _this3._localAssetPath;
        module._remoteAssetPath = _this3._remoteAssetPath;
      });

      return this;
    }
  }]);

  return Sassport;
})();

exports['default'] = sassport;
module.exports = exports['default'];