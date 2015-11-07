'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

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

var sassUtils = require('node-sass-utils')(_nodeSass2['default']);

var USE_INFERENCE = true;

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
 * Collection of utilities from 'node-sass-utils'.
 * @type {Object}
 */
sassport.utils = sassUtils;

sassport.utils.toSass = function (jsValue) {
  var infer = arguments.length <= 1 || arguments[1] === undefined ? USE_INFERENCE : arguments[1];

  if (infer && jsValue && !(typeof jsValue.toSass === 'function')) {
    // Infer Sass value from JS string value.
    if (_lodash2['default'].isString(jsValue)) {
      jsValue = sassport.utils.infer(jsValue);

      // Check each item in array for inferable values.
    } else if (_lodash2['default'].isArray(jsValue)) {
        jsValue = _lodash2['default'].map(jsValue, function (item) {
          return sassport.utils.toSass(item, infer);
        });

        // Check each value in object for inferable values.
      } else if (_lodash2['default'].isObject(jsValue)) {
          jsValue = _lodash2['default'].mapValues(jsValue, function (subval) {
            return sassport.utils.toSass(subval, infer);
          });
        }
  }

  return sassUtils.castToSass(jsValue);
};

sassport.utils.infer = function (jsValue) {
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
sassport.wrap = function (unwrappedFunc) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  options = _lodash2['default'].defaults(options, {
    done: true,
    quotes: false,
    infer: USE_INFERENCE
  });

  return (function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var outerDone = args.pop();

    var innerDone = function innerDone(result) {
      outerDone(sassport.utils.toSass(result, options.infer));
    };

    args = args.map(function (arg) {
      var result = sassUtils.castToJs(arg);

      // Get unitless value from number
      if (result.value) result = result.value;

      // Get simple get/set interface from map
      if (result.coerce) result = result.coerce;

      return result;
    });

    // Add 'done' callback if options.done is set true
    if (options.done) {
      args.push(innerDone);
    }

    var result = unwrappedFunc.apply(undefined, _toConsumableArray(args));

    // Quote string if options.quotes is set true
    if (options.quotes && _lodash2['default'].isString(result)) {
      result = '\'"' + result + '"\'';
    }

    if (typeof result !== 'undefined') {
      innerDone(result);
    }
  }).bind(this);
};

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
      infer: USE_INFERENCE
    });

    this.name = name;
    this.modules = modules;
    this.sass = options.renderer;

    this._importer = (0, _importer2['default'])(this);

    this._exportMeta = {
      contents: []
    };

    this._exports = {};

    this._mixins = {};

    this._localPath = _path2['default'].resolve('./');
    this._localAssetPath = null;
    this._remoteAssetPath = null;

    this.options = {
      functions: _defineProperty({
        'asset-path($source, $module: null)': (function (source, module) {
          var modulePath = sassUtils.isNull(module) ? '' : module.getValue();
          var assetPath = source.getValue();
          var localPath = modulePath ? this._localAssetPath : this._localPath;
          var assetUrl = '' + _path2['default'].join(localPath, modulePath, assetPath);

          return _nodeSass2['default'].types.String(assetUrl);
        }).bind(this),
        'asset-url($source, $module: null)': (function (source, module) {
          if (!this._remoteAssetPath) {
            throw 'Remote asset path not specified.\n\nSpecify the remote path with `sassport([...]).assets(localPath, remotePath)`.';
          }

          var modulePath = sassUtils.isNull(module) ? '' : 'sassport-assets/' + module.getValue();
          var assetPath = source.getValue();

          var assetUrl = 'url(' + _path2['default'].join(this._remoteAssetPath, modulePath, assetPath) + ')';

          return _nodeSass2['default'].types.String(assetUrl);
        }).bind(this)
      }, 'require($path, $propPath: null, $infer: ' + options.infer + ')', (function (file, propPath, infer, done) {
        file = file.getValue();
        propPath = sassUtils.isNull(propPath) ? false : propPath.getValue();

        var data = require(_path2['default'].resolve(this._localPath, file));

        if (propPath) {
          data = _lodash2['default'].get(data, propPath);
        }

        return sassport.utils.toSass(data, sassUtils.castToJs(infer));
      }).bind(this)),
      importer: this._importer,
      includePaths: ['node_modules'],
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
    key: '_beforeRender',
    value: function _beforeRender(options) {
      _lodash2['default'].extend(this.options, options);

      this.options.importer = options.importer || this._importer;
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

      var remotePath = arguments.length <= 1 || arguments[1] === undefined ? null : arguments[1];

      this._localPath = localPath;
      this._localAssetPath = _path2['default'].join(localPath, 'sassport-assets');
      this._remoteAssetPath = remotePath;

      // Create the local asset path directory
      _mkdirp2['default'].sync(this._localAssetPath);

      // Update the path information for each module
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