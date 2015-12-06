
import sass from 'node-sass';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';

import createImporter from './importer';
import utils from './utils';
import wrap from './utils/wrap';
import wrapAll from './utils/wrap-all';

/**
 * Factory for Sassport instances.
 * @param  {Array}  modules  array of modules to include in instance.
 * @param  {Object} options  Sassport-specific configuration options.
 * @return {Object}          returns Sassport instance.
 */
let sassport = function(modules = [], options = {}) {
  if (!Array.isArray(modules)) {
    modules = [modules];
  }

  let sassportInstance = new Sassport(null, modules, options);

  return sassportInstance;
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
sassport.wrap = wrap;
sassport.wrapAll = wrapAll;

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
      infer: true,
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

    this._loaders = {};

    this._localPath = path.resolve('./');
    this._localAssetPath = null;
    this._remoteAssetPath = null;

    this._onRequire = options.onRequire.bind(this);

    this.options = {
      functions: {
        'resolve-path($source, $module: null)': (source, module) => {
          let modulePath = utils.isNull(module) ? '' : module.getValue();
          let assetPath = source.getValue();
          let localPath = modulePath ? this._localAssetPath : this._localPath;
          let assetUrl = `${path.join(localPath, modulePath, assetPath)}`;

          return sass.types.String(assetUrl);
        },
        'resolve-url($source, $module: null)': (source, module) => {
          if (!this._remoteAssetPath) {
            throw 'Remote asset path not specified.\n\nSpecify the remote path with `sassport([...]).assets(localPath, remotePath)`.';
          }

          let modulePath = utils.isNull(module)
            ? ''
            : `sassport-assets/${module.getValue()}`;
          let assetPath = source.getValue();

          let assetUrl = `url(${path.join(this._remoteAssetPath, modulePath, assetPath)})`;

          return sass.types.String(assetUrl);
        },
        [`require($path, $propPath: null, $infer: ${options.infer})`]: (file, propPath, infer, done) => {
          file = file.getValue();
          propPath = utils.isNull(propPath)
            ? false
            : propPath.getValue();

          let data = this._onRequire(path.resolve(this._localPath, file));

          if (propPath) {
            data = _.get(data, propPath);
          }

          return utils.toSass(data, {
            infer: utils.castToJs(infer)
          });
        }
      },
      importer: this._importer,
      includePaths: ['node_modules'],
      sassportModules: modules // carried over to node-sass
    };

    this.modules.map((spModule) => {
      _.merge(this.options, spModule.options);

      _.merge(this._loaders, spModule._loaders);
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

  loaders(loaderMap) {
    _.extend(this._loaders, loaderMap);

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
      let sassValue = utils.sassString(utils.castToSass(value));

      this._exportMeta.contents.push(`${key}: ${sassValue};`)
    }

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


module.exports = sassport;
