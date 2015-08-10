var assert = require('assert');
var should = require('should');
var sass = require('node-sass');
var path = require('path');

var sassport = require('../dist/index.js');
var assertRenderSync = require('./util/assertRenderSync.js');

describe('Sassport require() function', function() {

  describe('standard usage', function() {
    var sassportModule = sassport([])
      .assets(path.join(__dirname, 'assets-test'));

    var testData = '$vars: require("simple-js-test.js"); test { color: map-get($vars, "primaryColor"); }';

    it('should render through sass.render', function(done) {
      sassportModule.render({ data: testData, outputStyle: 'compressed' }, function(err, result) {
        done(assert.equal(result.css.toString(), 'test{color:#C0FF33}\n'));
      });
    });
  });
});