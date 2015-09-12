
import sass from 'node-sass';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import { ncp } from 'ncp';
import mkdirp from 'mkdirp';

const sassUtils = require('node-sass-utils')(sass);

/**
 * Factory for Sassport instances.
 * @param  {Array}  modules  array of modules to include in instance.
 * @param  {Object} renderer Sass renderer (node-sass).
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
sassport.utils.toSass = (jsValue, infer = false) => {
  console.log(jsValue, infer);
  if (infer && typeof jsValue === 'string') {
    jsValue = sassport.utils.infer(jsValue);
  } else if (infer && typeof jsValue === 'object') {
    jsValue = _.mapValues(jsValue, (subval) => sassport.utils.toSass(subval, infer));
  } else if (infer && typeof jsValue === 'array') {
    jsValue = _.map(jsValue, (item) => sassport.utils.toSass(item, infer));
  }

  return sassUtils.castToSass(jsValue);
};

sassport.utils.infer = (jsValue) => {
  let result;

  try {  
    sass.renderSync({
      data: `$_: ___(${jsValue});`,
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
    infer: false
  });

  return function(...args) {
    let outerDone = args.pop();

    let innerDone = function(result) {
      outerDone(sassport.utils.toSass(result, options.infer));
    };

    args = args.map((arg) => {
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

    let result = unwrappedFunc(...args);

    // Quote string if options.quotes is set true
    if (options.quotes && _.isString(result)) {
      result = `\"${result}\"`;
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
   * @param  {Object} renderer Sass renderer (node-sass).
   * @return {Object}          instance of Sassport module.
   */
  constructor(name, modules = [], options = {}) {
    options = _.defaults(options, {
      renderer: sass,
      infer: false
    });

    this.name = name;
    this.modules = modules;
    this.sass = options.renderer;

    this._exportMeta = {
      contents: []
    };

    this._exports = {};

    this._mixins = {};

    this._localPath = path.resolve('./');
    this._localAssetPath = null;
    this._remoteAssetPath = null;

    this.options = {
      functions: {
        'asset-path($source, $module: null)': function(source, module) {
          let modulePath = sassUtils.isNull(module) ? '' : module.getValue();
          let assetPath = source.getValue();
          let localPath = modulePath ? this._localAssetPath : this._localPath;
          let assetUrl = `${path.join(localPath, modulePath, assetPath)}`;

          return sass.types.String(assetUrl);
        }.bind(this),
        'asset-url($source, $module: null)': function(source, module) {
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
        'require($path, $propPath: null, $infer: false)': function(file, propPath, infer, done) {
          file = file.getValue();
          propPath = sassUtils.isNull(propPath) ? false : propPath.getValue();

          let data = require(path.resolve(this._localPath, file));

          if (propPath) {
            data = _.get(data, propPath);
          }

          return sassport.utils.toSass(data, sassUtils.castToJs(infer));
        }.bind(this)
      },
      importer: this._importer,
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
    _.extend(this.options, options);

    this.options.importer = this._importer;
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

  _importer(url, prev, done) {
    let [ moduleName, ...moduleImports ] = url.split('/');
    let module = null;
    let exportMeta;
    let importerData = {
      contents: ''
    };

    module = _.find(this.options.sassportModules, (childModule) => {
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
        importerData.contents = fs.readFileSync(exportMeta.file);
      }
    }

    if (exportMeta.contents && exportMeta.contents.length) {
      importerData.contents += exportMeta.contents.join('');
    }

    if (exportMeta.directory) {
      let assetDirPath = path.join(module._localAssetPath, moduleName, moduleImports[0]);

      mkdirp(assetDirPath, (err, res) => {
        if (err) console.error(err);

        ncp(exportMeta.directory, assetDirPath, (err, res) => {
          done(importerData);
        });
      });
    } else {
      done(importerData);
    }
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
