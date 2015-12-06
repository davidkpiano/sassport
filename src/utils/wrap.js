import isString from 'lodash/lang/isString';
import isArray from 'lodash/lang/isArray';
import defaults from 'lodash/object/defaults';

import utils from './index';

function getJsValue(arg) {
  let result = utils.castToJs(arg);

  if (isArray(result)) {
    return result.map((arg) => getJsValue(arg));
  }

  // Get unitless value from number
  if (result.hasOwnProperty('value')) { 
    return result.value;
  }

  // Get simple get/set interface from map
  if (result.hasOwnProperty('coerce')) { 
    return result.coerce;
  }

  return result;
}

export default function(unwrappedFunc, options = {}) {
  options = defaults(options, {
    done: true,
    quotes: false,
    infer: true
  });

  return (...args) => {
    let outerDone = args.pop();
    let result;

    let innerDone = (innerResult) => {
      outerDone(utils.toSass(innerResult, options.infer));
    };

    args = getJsValue(args);

    // Add 'done' callback if options.done is set true
    if (options.done) {
      args.push(innerDone);
    }

    result = unwrappedFunc.apply(this, args);

    // Quote string if options.quotes is set true
    if (options.quotes && isString(result)) {
      result = `'"${result}"'`;
    }

    if (typeof result !== 'undefined') {
      innerDone(result);
    }
  }
}; 