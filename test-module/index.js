var sassport = require('../dist/index.js');

module.exports = sassport.module('test')
  .exports({
    'images': __dirname + '/assets',
    'vars': __dirname + '/assets/testvars.js'
  });