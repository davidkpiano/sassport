
import sass from 'node-sass';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';

const sassUtils = require('node-sass-utils')(sass);

import createImporter from './importer';

const USE_INFERENCE = true;

/**
 * Factory for Sassport instances.
 * @param  {Array}  modules  array of modules to include in instance.
 * @param  {Object} options  Sassport-specific configuration options.
 * @return {Object}          returns Sassport instance.
 */
const sassport = function(modules = [], options = {}) {
  if (!Array.isArray(modules)) {
    modules = [modules];
  }

  let sassportInstance = new Sassport(null, modules, options);

  return sassportInstance;
};

/**
 * Collection of utilities from 'node-sass-utils'.
 * @type {Object}
 */
sassport.utils = sassUtils;

sassport.utils.toSass = (jsValue, infer = USE_INFERENCE) => {
  if (infer && jsValue && !(typeof jsValue.toSass === 'function')) {  
    // Infer Sass value from JS string value.
    if (_.isString(jsValue)) {
      jsValue = sassport.utils.infer(jsValue);

    // Check each item in array for inferable values.
    } else if (_.isArray(jsValue)) {
      jsValue = _.map(jsValue, (item) => 
        sassport.utils.toSass(item, infer));

    // Check each value in object for inferable values.
    } else if (_.isObject(jsValue)) {
      jsValue = _.mapValues(jsValue, (subval) => 
        sassport.utils.toSass(subval, infer));
    }
  }

  return sassUtils.castToSass(jsValue);
};

sassport.utils.infer = (jsValue) => {
  let result;

  try {  
    sass.renderSync({
      data: `$_: ___((${jsValue}));`,
      functions: {
        '___($value)': (value) => {
          result = value;

          return value;
        }
      }
    });
  } catch(e) {
    return jsValue;
  }

  return result;
};

/**
 * Factory for Sassport modules.
 * @param  {String} name name of module.
 * @return {Object}      returns Sassport module.
 */
sassport.module = function(name) {
  return new Sassport(name);
};

/**
 * Wraps a normal JS function where arguments are coerced from Sass values to JS values, and return values are coerced from JS values to Sass values.
 * @param  {Function} unwrappedFunc the function to wrap.
 * @param  {Object} options       (optional) options to pass into the wrapped function.
 * @return {Function}               Returns a wrapped function.
 */
sassport.wrap = function(unwrappedFunc, options = {}) {
  options = _.defaults(options, {
    done: true,
    quotes: false,
    infer: USE_INFERENCE
  });

  return function(...args) {
    let outerDone = args.pop();

    let innerDone = function(result) {
      outerDone(sassport.utils.toSass(result, options.infer));
    };

    args = args.map((arg) => {
        let result = sassUtils.castToJs(arg);

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

    let result = unwrappedFunc(...args);

    // Quote string if options.quotes is set true
    if (options.quotes && _.isString(result)) {
      result = `'"${result}"'`;
    }

    if (typeof result !== 'undefined') {
      innerDone(result);
    }
  }.bind(this);
}; 


class Sassport {
  /**
   * Constructor for Sassport instance/module.
   * @param  {String} name     name of Sassport module.
   * @param  {Array}  modules  array of modules to include in instance.
   * @param  {Object} options  Sassport-specific configuration options.
   * @return {Object}          instance of Sassport module.
   */
  constructor(name, modules = [], options = {}) {
    options = _.defaults(options, {
      renderer: sass,
      infer: USE_INFERENCE,
      onRequire: (filePath) => {
        try {
          return require(path.resolve(this._localPath, filePath));
        } catch (e) {
          console.error(e);
        }
      }
    });

    this.name = name;
    this.modules = modules;
    this.sass = options.renderer;

    this._importer = createImporter(this);

    this._exportMeta = {
      contents: []
    };

    this._exports = {};

    this._mixins = {};

    this._localPath = path.resolve('./');
    this._localAssetPath = null;
    this._remoteAssetPath = null;

    this._onRequire = options.onRequire.bind(this);

    this.options = {
      functions: {
        'resolve-path($source, $module: null)': function(source, module) {
          let modulePath = sassUtils.isNull(module) ? '' : module.getValue();
          let assetPath = source.getValue();
          let localPath = modulePath ? this._localAssetPath : this._localPath;
          let assetUrl = `${path.join(localPath, modulePath, assetPath)}`;

          return sass.types.String(assetUrl);
        }.bind(this),
        'resolve-url($source, $module: null)': function(source, module) {
          if (!this._remoteAssetPath) {
            throw 'Remote asset path not specified.\n\nSpecify the remote path with `sassport([...]).assets(localPath, remotePath)`.';
          }

          let modulePath = sassUtils.isNull(module)
            ? ''
            : `sassport-assets/${module.getValue()}`;
          let assetPath = source.getValue();

          let assetUrl = `url(${path.join(this._remoteAssetPath, modulePath, assetPath)})`;

          return sass.types.String(assetUrl);
        }.bind(this),
        [`require($path, $propPath: null, $infer: ${options.infer})`]: function(file, propPath, infer, done) {
          file = file.getValue();
          propPath = sassUtils.isNull(propPath) ? false : propPath.getValue();

          let data = this._onRequire(path.resolve(this._localPath, file));

          if (propPath) {
            data = _.get(data, propPath);
          }

          return sassport.utils.toSass(data, sassUtils.castToJs(infer));
        }.bind(this)
      },
      importer: this._importer,
      includePaths: ['node_modules'],
      sassportModules: modules // carried over to node-sass
    };

    this.modules.map((module) => {
      _.merge(this.options, module.options);
    });
  }

  module(name) {
    this.name = name;

    return this;
  }

  _beforeRender(options) {
    this.options.importer = options.importer || this._importer;
    this.options.includePaths = this.options.includePaths
      .concat(options.includePaths || []);

    _.extend(this.options, options);
  }

  render(options, emitter) {
    this._beforeRender(options);

    return this.sass.render(this.options, emitter);
  }

  renderSync(options, emitter) {
    this._beforeRender(options);

    return this.sass.renderSync(this.options, emitter);
  }

  functions(functionMap) {
    _.extend(this.options.functions, functionMap);

    return this;
  }

  exports(exportMap) {
    for (let exportKey in exportMap) {
      let exportPath = exportMap[exportKey];
      let exportMeta = {
        file: null,
        directory: null,
        content: null
      };

      if (fs.lstatSync(exportPath).isDirectory()) {
        exportMeta.directory = exportPath;

        delete exportMeta.file;
      } else {
        exportMeta.file = exportPath;
      }

      this._exports[exportKey] = exportMeta;
    }

    return this;
  }

  getLocalAssetPath() {
    return this._localAssetPath;
  }

  variables(variableMap) {
    for (let key in variableMap) {
      let value = variableMap[key];
      let sassValue = sassUtils.sassString(sassUtils.castToSass(value));

      this._exportMeta.contents.push(`${key}: ${sassValue};`)
    }

    return this;
  }

  rulesets(rulesets) {
    rulesets.map((ruleset) => {
      let renderedRuleset = this.sass
        .renderSync({ data: ruleset })
        .css.toString();

      this._exportMeta.contents.push(renderedRuleset);
    }.bind(this));

    return this;
  }

  assets(localPath, remotePath = null) {
    this._localPath = localPath;
    this._localAssetPath = path.join(localPath, 'sassport-assets');
    this._remoteAssetPath = remotePath;

    // Create the local asset path directory
    mkdirp.sync(this._localAssetPath);

    // Update the path information for each module
    this.modules.map((module) => {
      module._localPath = this._localPath;
      module._localAssetPath = this._localAssetPath;
      module._remoteAssetPath = this._remoteAssetPath;
    });

    return this;
  }
}


export default sassport;
