var assert = require('assert');
var should = require('should');
var sass = require('node-sass');

var sassport = require('../dist/index.js');
var assertRenderSync = require('./util/assertRenderSync.js');

console.log(sassport.eyeglass('eyeglass-math'));

sassport([ sassport.eyeglass('eyeglass-math') ]).render({
  file: __dirname + '/fixtures/eyeglass-test.scss'
}, function(err, res) {
  err && console.error(err);
  console.log(res.css.toString());
});