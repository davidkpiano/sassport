import isFunction from 'lodash/lang/isFunction';
import flatten from 'lodash/array/flatten';
import defaults from 'lodash/object/defaults';

import wrap from './wrap';

const wrapAll = (collection, options = {}) => {
  return wrap((key, ...args) => {
    let done = args.pop();
    let result = collection[key];

    if (isFunction(result)) {
      result = result.apply(collection, flatten(args));
    }

    return result;
  }, options);
}

export default wrapAll;