import sass from 'node-sass';
import createSassUtils from 'node-sass-utils';
import _ from 'lodash';

const sassUtils = createSassUtils(sass);

sassUtils.toSass = (jsValue, options = {}) => {
  if (options.infer && jsValue && !(typeof jsValue.toSass === 'function')) {  
    // Infer Sass value from JS string value.
    if (_.isString(jsValue)) {
      jsValue = sassUtils.infer(jsValue);

    // Check each item in array for inferable values.
    } else if (_.isArray(jsValue)) {
      jsValue = _.map(jsValue, (item) => 
        sassUtils.toSass(item, options));

    // Check each value in object for inferable values.
    } else if (_.isObject(jsValue)) {
      jsValue = _.mapValues(jsValue, (subval) => 
        sassUtils.toSass(subval, options));
    }
  }

  // Add units to number value if necessary
  if (options.unit && typeof jsValue === 'number') {
    jsValue = sass.types.Number(jsValue, options.unit);
  }

  return sassUtils.castToSass(jsValue);
};

sassUtils.infer = (jsValue) => {
  let result;

  try {  
    sass.renderSync({
      data: `$_: ___((${jsValue}));`,
      functions: {
        '___($value)': (value) => {
          result = value;

          return value;
        }
      }
    });
  } catch(e) {
    return jsValue;
  }

  return result;
};

/**
 * Collection of utilities from 'node-sass-utils'.
 * @type {Object}
 */
export default sassUtils;