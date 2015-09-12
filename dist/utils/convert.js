"use strict";

// import sass from 'node-sass';
// import _ from 'lodash';

// const sassUtils = require('node-sass-utils')(sass);

// const sassTypes = {
//   'String': {
//     coerce: (value, options = {}) {
//       let result = options.quotes
//         ? `"${value}"`
//         : value;

//       return sass.types.String(value);
//     },
//     test: (value) => typeof value === 'string'
//   },
//   'Boolean': {
//     coerce: (value) => sass.types.Boolean(value),
//     test: (value) => typeof value === 'boolean'
//   },
//   'Null': {
//     coerce: () => sass.types.Null(),
//     test: (value) => typeof value === 'undefined' || value === null
//   },
//   'Number': {
//     coerce: (value) => sass.types.Number(value),
//     test: (value) => typeof value === 'number'
//   },
//   'List': {
//     coerce: (value, options = {}) => {
//       let list = sass.types.List(value.length);

//       value.map((item, index) => list.setValue(index, convert.toSass(value)));

//       list.setSeparator(options.separator || 'space');

//       return list;
//     }
//   },
//   'Sass': {
//     coerce: (value) => value,
//     test: (value) => value && value.constructor.name.indexOf('Sass') === 0
//   },
//   'Map': {
//     coerce: (value, options = {}) => {
//       let keys = _.keys(value);
//       let map = sass.types.Map(keys.length);

//       keys.map((key, index) => {
//         map.setKey(index, key);
//         map.setValue(index, convert.toSass(value[key]));
//       });

//       return map;
//     }
//   }
// }

// const convert = {
//   infer(jsValue) {
//     let sassValue;

//     sass.renderSync({
//       data: `$_: s(${jsValue});`,
//       functions: {
//         's($val)': function(val) {
//           sassValue = val;

//           return val;
//         }
//       }
//     });

//     return sassValue;
//   }
// };

// console.log(convert.infer('235px').getUnit());

// export default convert;