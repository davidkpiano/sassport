
import sass from 'node-sass';
import _ from 'lodash';

const sassUtils = require('node-sass-utils')(sass);

let sassport = function(plugins) {
  if (!Array.isArray(plugins)) {
    plugins = [plugins];
  }

  return new Renderer(plugins);
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
}

class Sassport {
  constructor() {
    this.options = {
      functions: {}
    };
  }

  functions(functions) {
    _.extend(this.options.functions, functions);

    console.log(this);

    return this;
  }
}

class Renderer {
  constructor(plugins = []) {
    this.sass = sass;

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
      _.merge(this.options, { functions: plugin.options.functions });
    }, this);
  }
}

export default sassport;
