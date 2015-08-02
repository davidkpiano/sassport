
import sass from 'node-sass';
import _ from 'lodash';
import fs from 'fs';

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
    let done = args.pop();
    let innerDone = function(result) {
      return done(options.returnSass ? result : sassUtils.castToSass(result));
    };

    args = args.map(arg => sassUtils.castToJs(arg));

    let result = unwrappedFunc(...args, innerDone);

    return innerDone(result);
  }
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

    let options = {
      functions: {
        'asset-url($source)': sassport.wrap(function(source) {
          return `/dist/${source}`;
        })
      },
      importer: this._importer.bind(this)
    };

    modules.map(module => {
      _.merge(options, module.options);
    });

    this.options = options;
  }

  module(name) {
    this.name = name;

    return this;
  }

  render(options, emitter) {
    _.extend(this.options, options);

    return this.sass.render(this.options, emitter);
  }

  renderSync(options, emitter) {
    _.extend(this.options, options);

    return this.sass.render(this.options, emitter);
  }

  functions(functionMap) {
    _.extend(this.options.functions, functionMap);

    return this;
  }

  exports(exportMap) {
    for (let path in exportMap) {
      let exportFile = exportMap[path];
      let exportMeta = {};

      if (path === 'default') {
        this._exportMeta.file = exportFile;

        continue;
      }

      exportMeta = {
        file: exportFile
      };

      this._exports[path] = (exportMeta);
    }

    return this;
  }

  _importer(url, prev, done) {
    let [ moduleName, ...moduleImports ] = url.split('/');
    let module = null;
    let importerData = {};

    if (moduleName === this.name) {
      module = this;
    } else {
      module = this.modules.find((childModule) => {
        childModule.name === moduleName;
      });
    }

    if (!module) return prev;

    if (moduleImports.length) {
      console.log(moduleImports[0]);
      return this._exports[moduleImports[0]];
    } 

    if (module._exportMeta.file) {
      if (!module._exportMeta.contents.length) {
        importerData.file = module._exportMeta.file;
      } else {
        importerData.contents = fs.readFileSync(module._exportMeta.file);
      }
    }

    if (module._exportMeta.contents.length) {
      importerData.contents += module._exportMeta.contents.join('');
    }

    done(importerData);
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
}


export default sassport;
