var sassport = require('../../dist/index.js');
var sass = require('node-sass');

module.exports = sassport.module('single-module')
  .functions({
    'single-unwrapped': function(msg) {
      return sass.types.String(msg.getValue() + '!!!');
    },
    'single-wrapped': sassport.wrap(function(msg) {
      return msg + '!!!';
    })
  });