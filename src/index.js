
import sass from 'node-sass';
import _ from 'lodash';
import fs from 'fs';

import mixinTemplate from './templates/mixin.js';

const sassUtils = require('node-sass-utils')(sass);

const ROOT = 'root';

let sassport = function(modules, renderer = sass) {
  if (!Array.isArray(modules)) {
    modules = [modules];
  }

  let sassportInstance = new Sassport(ROOT, modules, renderer);

  return sassportInstance;
};

sassport.module = function(name, modules = []) {
  return new Sassport(name, modules);
};

sassport.wrap = function(unwrappedFunc, returnSass = false) {
  return function(...args) {
    args = args.map(arg => sassUtils.castToJs(arg));

    let result = unwrappedFunc(...args);

    return returnSass ? result : sassUtils.castToSass(result);
  }
};

sassport.utils = sassUtils;

class Sassport {
  constructor(name, modules = [], renderer = sass) {
    this.name = name;
    this.modules = modules;
    this.sass = renderer;

    this._default = {
      contents: [
        '@mixin __sassport-mixin($id, $args...){_:__sassport-render-mixin($id, $args...);@content;}'
      ]
    };

    this._mixins = {};

    let options = {
      functions: {
        '__sassport-render-mixin($id, $args...)': function(id, args) {
          id = id.getValue();

          let mixin = this._mixins[id];

          return sassUtils.castToSass('_;'+mixin());
        }.bind(this)
      },
      importer: [ this._defaultImporter.bind(this) ]
    };

    modules.map(module => {
      _.merge(options, module.options);
    });

    this.options = options;
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
      let fileExists = true;

      fs.statSync(exportFile, (err) => {
        if (err && err.code === 'ENOENT') {
          console.log(`File at path "${err.path}" does not exist. Skipping import.`);

          fileExists = false;
        }
      });

      if (!fileExists) continue;

      if (path === 'default') {
        this._default.file = exportFile;

        continue;
      }

      let importer = function(url, prev, done) {
        if (url == exportUrl) {
          done({file: exportFile});
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

  mixins(mixinMap) {
    for (let signature in mixinMap) {
      let mixin = mixinMap[signature]; // function that returns a string
      let id = _.uniqueId()+'';

      this._mixins[id] = mixin;

      this._default.contents.push(mixinTemplate(signature, id));
    }

    return this;
  }
}


export default sassport;
