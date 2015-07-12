
import sass from 'node-sass';
import _ from 'lodash';
import fs from 'fs';

import mixinTemplate from './templates/mixin.js';

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

sassport.wrap = function(unwrappedFunc, returnSass = false) {
  return function(...args) {
    args = args.map(arg => sassUtils.castToJs(arg));

    let result = unwrappedFunc(...args);

    return returnSass ? result : sassUtils.castToSass(result);
  }
};

sassport.asset = function(file, transformer) {
  let assetMeta = {
    url: file
  };

  if (transformer) {
    _.merge(assetMeta, transformer.call(null, file));
  }

  // Quote strings
  assetMeta = _.mapValues(assetMeta, (value) => {
    return _.isString(value) ? `"${value}"` : value;
  });

  return assetMeta;
};

sassport.utils = sassUtils;

class Sassport {
  constructor(name, modules = [], renderer = sass) {
    this.name = name;
    this.modules = modules;
    this.sass = renderer;

    this._default = {
      contents: []
    };

    this._mixins = {};

    let options = {
      functions: {},
      importer: [ this._defaultImporter.bind(this) ]
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
    if (arguments.length == 1) {
      exportMap = { default: arguments[0] };
    } else if (arguments.length == 2) {
      exportMap = { [arguments[0]]: arguments[1] };
    }

    for (let path in exportMap) {
      let exportUrl = `${this.name}/${path}`;
      let exportFile = exportMap[path];

      if (path === 'default') {
        this._default.file = exportFile;

        continue;
      }

      let importer = function(url, prev, done) {
        if (url == exportUrl) {
          done({ file: exportFile });
        }
      }

      this.options.importer.push(importer);
    }

    return this;
  }

  _defaultImporter(url, prev, done) {
    if (url === this.name) {
      let importerData = {};

      if (this._default.file) {
        if (!this._default.contents.length) {
          importerData.file = this._default.file;
        } else {
          importerData.contents = fs.readFileSync(this._default.file);
        }
      }

      if (this._default.contents.length) {
        console.log(this._default.contents);
        importerData.contents += this._default.contents.join('');
      }

      done(importerData);
    }
  }

  variables(variableMap) {
    for (let key in variableMap) {
      let value = variableMap[key];
      let sassValue = sassUtils.sassString(sassUtils.castToSass(value));

      this._default.contents.push(`${key}: ${sassValue};`)
    }

    return this;
  }

  rulesets(rulesets) {
    rulesets.map((ruleset) => {
      let renderedRuleset = this.sass.renderSync({ data: ruleset }).css.toString();

      this._default.contents.push(renderedRuleset);
    }.bind(this));

    return this;
  }

  assets() {

  }
}


export default sassport;
