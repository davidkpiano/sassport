
import sass from 'node-sass';
import _ from 'lodash';

const sassUtils = require('node-sass-utils')(sass);

let sassport = function(plugins, renderer = sass) {
  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }

  return new Renderer(plugins, renderer);
};

sassport.functions = function(funcMap) {
  let sassportInstance = new Sassport();

  return sassportInstance.functions(funcMap);
};

sassport.plain = function(plainFunc, returnPlain = false) {
  return function(...args) {
    args = args.map(arg => sassUtils.castToJs(arg));

    let result = plainFunc(...args);

    return returnPlain ? result : sassUtils.castToSass(result);
  }
};

sassport.imports = function(importMap) {
  let sassportInstance = new Sassport();

  return sassportInstance.imports(importMap);
}

class Sassport {
  constructor() {
    this.options = {
      functions: {}
    };
  }

  functions(functions) {
    _.extend(this.options.functions, functions);

    return this;
  }
}

class Renderer {
  constructor(plugins = [], renderer) {
    this.sass = renderer;

    this.options = {
      functions: {}
    };

    this._includeSassports(plugins);
  }

  render(options, emitter) {
    _.extend(options, this.options);

    return this.sass.render(options, emitter);
  }

  _includeSassports(plugins) {

    plugins.forEach(plugin => {
      if (plugin instanceof Sassport === false) {
        if (_.isFunction(plugin)) {
          console.log(plugin.name);

          plugin = sassport.functions({
            [plugin.name]: sassport.plain(plugin)
          });
        }
      }

      _.merge(this.options, { functions: plugin.options.functions });
    }, this);
  }
}

export default sassport;
