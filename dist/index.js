'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _importer = require('./importer');

var _importer2 = _interopRequireDefault(_importer);

var _utils = require('./utils');

var _utils2 = _interopRequireDefault(_utils);

var _utilsWrap = require('./utils/wrap');

var _utilsWrap2 = _interopRequireDefault(_utilsWrap);

/**
 * Factory for Sassport instances.
 * @param  {Array}  modules  array of modules to include in instance.
 * @param  {Object} options  Sassport-specific configuration options.
 * @return {Object}          returns Sassport instance.
 */
var sassport = function sassport() {
  var modules = arguments.length <= 0 || arguments[0] === undefined ? [] : arguments[0];
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  if (!Array.isArray(modules)) {
    modules = [modules];
  }

  var sassportInstance = new Sassport(null, modules, options);

  return sassportInstance;
};

/**
 * Factory for Sassport modules.
 * @param  {String} name name of module.
 * @return {Object}      returns Sassport module.
 */
sassport.module = function (name) {
  return new Sassport(name);
};

/**
 * Wraps a normal JS function where arguments are coerced from Sass values to JS values, and return values are coerced from JS values to Sass values.
 * @param  {Function} unwrappedFunc the function to wrap.
 * @param  {Object} options       (optional) options to pass into the wrapped function.
 * @return {Function}               Returns a wrapped function.
 */
sassport.wrap = _utilsWrap2['default'];

var Sassport = (function () {
  /**
   * Constructor for Sassport instance/module.
   * @param  {String} name     name of Sassport module.
   * @param  {Array}  modules  array of modules to include in instance.
   * @param  {Object} options  Sassport-specific configuration options.
   * @return {Object}          instance of Sassport module.
   */

  function Sassport(name) {
    var _this = this;

    var modules = arguments.length <= 1 || arguments[1] === undefined ? [] : arguments[1];
    var options = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    _classCallCheck(this, Sassport);

    options = _lodash2['default'].defaults(options, {
      renderer: _nodeSass2['default'],
      infer: true,
      onRequire: function onRequire(filePath) {
        try {
          return require(_path2['default'].resolve(_this._localPath, filePath));
        } catch (e) {
          console.error(e);
        }
      }
    });

    this.name = name;
    this.modules = modules;
    this.sass = options.renderer;

    this._importer = (0, _importer2['default'])(this);

    this._exportMeta = {
      contents: []
    };

    this._exports = {};

    this._loaders = {};

    this._localPath = _path2['default'].resolve('./');
    this._localAssetPath = null;
    this._remoteAssetPath = null;

    this._onRequire = options.onRequire.bind(this);

    this.options = {
      functions: _defineProperty({
        'resolve-path($source, $module: null)': (function (source, module) {
          var modulePath = _utils2['default'].isNull(module) ? '' : module.getValue();
          var assetPath = source.getValue();
          var localPath = modulePath ? this._localAssetPath : this._localPath;
          var assetUrl = '' + _path2['default'].join(localPath, modulePath, assetPath);

          return _nodeSass2['default'].types.String(assetUrl);
        }).bind(this),
        'resolve-url($source, $module: null)': (function (source, module) {
          if (!this._remoteAssetPath) {
            throw 'Remote asset path not specified.\n\nSpecify the remote path with `sassport([...]).assets(localPath, remotePath)`.';
          }

          var modulePath = _utils2['default'].isNull(module) ? '' : 'sassport-assets/' + module.getValue();
          var assetPath = source.getValue();

          var assetUrl = 'url(' + _path2['default'].join(this._remoteAssetPath, modulePath, assetPath) + ')';

          return _nodeSass2['default'].types.String(assetUrl);
        }).bind(this)
      }, 'require($path, $propPath: null, $infer: ' + options.infer + ')', (function (file, propPath, infer, done) {
        file = file.getValue();
        propPath = _utils2['default'].isNull(propPath) ? false : propPath.getValue();

        var data = this._onRequire(_path2['default'].resolve(this._localPath, file));

        if (propPath) {
          data = _lodash2['default'].get(data, propPath);
        }

        return _utils2['default'].toSass(data, _utils2['default'].castToJs(infer));
      }).bind(this)),
      importer: this._importer,
      includePaths: ['node_modules'],
      sassportModules: modules // carried over to node-sass
    };

    this.modules.map(function (spModule) {
      _lodash2['default'].merge(_this.options, spModule.options);

      _lodash2['default'].merge(_this._loaders, spModule._loaders);
    });
  }

  _createClass(Sassport, [{
    key: 'module',
    value: function module(name) {
      this.name = name;

      return this;
    }
  }, {
    key: '_beforeRender',
    value: function _beforeRender(options) {
      this.options.importer = options.importer || this._importer;
      this.options.includePaths = this.options.includePaths.concat(options.includePaths || []);

      _lodash2['default'].extend(this.options, options);
    }
  }, {
    key: 'render',
    value: function render(options, emitter) {
      this._beforeRender(options);

      return this.sass.render(this.options, emitter);
    }
  }, {
    key: 'renderSync',
    value: function renderSync(options, emitter) {
      this._beforeRender(options);

      return this.sass.renderSync(this.options, emitter);
    }
  }, {
    key: 'functions',
    value: function functions(functionMap) {
      _lodash2['default'].extend(this.options.functions, functionMap);

      return this;
    }
  }, {
    key: 'loaders',
    value: function loaders(loaderMap) {
      _lodash2['default'].extend(this._loaders, loaderMap);

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
    key: 'variables',
    value: function variables(variableMap) {
      for (var key in variableMap) {
        var value = variableMap[key];
        var sassValue = _utils2['default'].sassString(_utils2['default'].castToSass(value));

        this._exportMeta.contents.push(key + ': ' + sassValue + ';');
      }

      return this;
    }
  }, {
    key: 'assets',
    value: function assets(localPath) {
      var _this2 = this;

      var remotePath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this._localPath = localPath;
      this._localAssetPath = _path2['default'].join(localPath, 'sassport-assets');
      this._remoteAssetPath = remotePath;

      // Create the local asset path directory
      _mkdirp2['default'].sync(this._localAssetPath);

      // Update the path information for each module
      this.modules.map(function (module) {
        module._localPath = _this2._localPath;
        module._localAssetPath = _this2._localAssetPath;
        module._remoteAssetPath = _this2._remoteAssetPath;
      });

      return this;
    }
  }]);

  return Sassport;
})();

exports['default'] = sassport;
module.exports = exports['default'];