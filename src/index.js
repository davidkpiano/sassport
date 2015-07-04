
import sass from 'node-sass';
import _ from 'lodash';

let sassport = function(imports) {
  if (!Array.isArray(imports)) {
    imports = [imports];
  }

  return new Renderer(imports);
};

sassport.functions = function(funcMap) {
  let sassportInstance = new Sassport();

  return sassportInstance.functions(funcMap);
};

sassport.plain = function(pureFunc) {
  return function(...args) {
    for (let i = 0; i < args.length; i++) {
      args[i] = convertSassValue(args[i]);
    }

    let result = pureFunc(...args);

    return inferPlainValue(result);
  }
}

let inferPlainValue = function(value) {
  if (value === null || value === undefined) {
    return sass.types.Null.NULL;
  }

  if (_.isString(value)) {
    return sass.types.String(value);
  }

  if (_.isNumber(value)) {
    return sass.types.Number(value);
  }

  if (_.isBoolean(value)) {
    return value ? sass.types.Boolean.TRUE : sass.types.boolean.FALSE;
  }

  if (_.isArray(value)) {
    let length = value.length;
    let result = sass.types.List(length);

    for (let i = 0; i < length; i++) {
      result = result.setValue(i, inferPlainValue(value[i]));
    }

    return result;
  }

  if (_.isObject(value)) {
    if (value instanceof Map) {
      let result = sass.types.Map(value.size());

      let keys = value.keys();

      for (let i = 0; i < keys.length; i++) {
        let key = inferPlainValue(key);
        let val = value.getValue(key);

        result.setValue(key, val);
      }

      return result;
    }
  }
}

let convertSassValue = function(value) {
  if (!value.getR && !value.getValue) {
    return null;
  }

  if (value.getKey) {
    let length = value.getLength();
    let result = new Map();

    for (let i = 0; i < length; i++) {
      let key = value.getKey(i);
      let val = value.getValue(i);

      result.set(convertSassValue(key), convertSassValue(val));
    }

    return result;
  }

  if (value.getLength) {
    let length = value.getLength();
    let result = [];

    for (let i = 0; i < length; i++) {
      result.push(value.getValue(i));
    }

    return result.map(item => convertSassValue(item));
  }

  if (value.getR) {
    return {
      r: value.getR(),
      g: value.getG(),
      b: value.getB(),
      a: value.getA()
    };
  }

  return value.getValue();
}

class Sassport {
  constructor() {
    this.options = {};
  }

  functions(funcMap) {
    _.extend(this.options, funcMap);

    return this.options;
  }
}

class Renderer {
  constructor(sassports = []) {
    this.options = {};
    this.functions = {};

    this._includeSassports(sassports);
  }

  _includeSassports(sassports) {
    sassports.forEach(sassport => {
      let {functions} = sassport;

      _.extend(this, functions);
    }, this);
  }
}

export default sassport;
