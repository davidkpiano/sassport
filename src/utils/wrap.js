import isString from 'lodash/lang/isString';
import defaults from 'lodash/object/defaults';

import utils from './index';

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

    args = args.map((arg) => {
        let result = utils.castToJs(arg);

        // Get unitless value from number
        if (result.value) result = result.value;

        // Get simple get/set interface from map
        if (result.coerce) result = result.coerce;

        return result;
      });

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
  }.bind(this);
}; 