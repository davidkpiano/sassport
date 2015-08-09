
import sass from 'node-sass';
import _ from 'lodash';
import path from 'path';
import fs from 'fs';
import { ncp } from 'ncp';
import mkdirp from 'mkdirp';

const sassUtils = require('node-sass-utils')(sass);

let sassport = function(modules, renderer = sass) {
  if (!Array.isArray(modules)) {
    modules = [modules];
  }

  let sassportInstance = new Sassport(null, modules, renderer);

  return sassportInstance;
};

sassport.module = function(name) {
  return new Sassport(name);
};

sassport.wrap = function(unwrappedFunc, options = {}) {
  return function(...args) {
    let outerDone = args.pop();

    let innerDone = function(result) {
      outerDone(options.returnSass ? result : sassUtils.castToSass(result));
    };

    args = args.map(arg => sassUtils.castToJs(arg));

    let result = unwrappedFunc(...args, innerDone);

    if (typeof result !== 'undefined') {
      innerDone(result);
    }
  }.bind(this);
}; 

sassport.utils = sassUtils;

class Sassport {
  constructor(name, modules = [], renderer = sass) {
    this.name = name;
    this.modules = modules;
    this.sass = renderer;

    this._exportMeta = {
      contents: []
    };

    this._exports = {};

    this._mixins = {};

    this._localAssetPath = this._remoteAssetPath = null;

    this.options = {
      functions: {
        'asset-url($source, $module: null)': function(source, module) {
          let modulePath = sassUtils.isNull(module) ? '' : module.getValue();
          let assetPath = source.getValue();
          let assetUrl = `url(${path.join(this._remoteAssetPath, modulePath, assetPath)})`;

          return sass.types.String(assetUrl);
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

  render(options, emitter) {
    _.extend(this.options, options);

    this.options.importer = this._importer;

    return this.sass.render(this.options, emitter);
  }

  renderSync(options, emitter) {
    _.extend(this.options, options);

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
    let importerData = {
      contents: ''
    };
    let exportMeta;

    let sassportModules = this.options.sassportModules;

    module = _.find(sassportModules, (childModule) => {
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
    this._localAssetPath = path.join(localPath, 'sassport-assets');
    this._remoteAssetPath = remotePath;

    mkdirp.sync(this._localAssetPath);

    this.modules.map((module) => {
      module._localAssetPath = this._localAssetPath;
      module._remoteAssetPath = this._remoteAssetPath;
    });

    return this;
  }
}

export default sassport;
