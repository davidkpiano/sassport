
import sass from 'node-sass';
import _ from 'lodash';

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

    let options = {
      functions: {},
      importer: []
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
      let exportUrl = `${this.name}`;
      let exportFile = exportMap[path];

      if (path !== 'default') {
        exportUrl += `/${path}`;
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
}


export default sassport;
