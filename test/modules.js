var assert = require('assert');
var should = require('should');
var sass = require('node-sass');

import sassport from '../dist/index.js';
var assertRenderSync = require('./util/assertRenderSync.js');

describe('Sassport.module', function() {

  describe('plugin module', function() {
    var sassportModule = sassport.module('test');

    it('should return a Sassport module instance (duck-typed)', function(done) {
      assert.equal(sassportModule.name, 'test');
      assert.ok(sassportModule.modules && sassportModule.modules.length === 0);
      assert.ok(sassportModule.sass);

      done();
    });
  });

  describe('root (consumer) module', function() {
    var testModule = sassport.module('test');
    var sassportModule = sassport([testModule]);

    it('should return a Sassport module instance (duck-typed)', function(done) {
      assert.ok(!sassportModule.name);
      assert.ok(sassportModule.modules);
      assert.ok(sassportModule.modules.length === 1);
      assert.equal(sassportModule.modules[0], testModule);
      assert.ok(sassportModule.sass);

      done();
    });
  });

  describe('sass.render', function() {
    var sassportModule = sassport([]);
    var testData = 'test.async { foo: 1 + 1; }'

    it('should render through sass.render', function(done) {
      sassportModule.render({ data: testData, outputStyle: 'compressed' }, function(err, result) {
        done(assert.equal(result.css.toString(), 'test.async{foo:2}\n'));
      });
    });
  });

  describe('sass.renderSync', function() {
    var sassportModule = sassport([]);
    var testData = 'test.sync { foo: 2 + 2; }'

    it('should render through sass.renderSync', function(done) {
      var result = sassportModule.renderSync({ data: testData, outputStyle: 'compressed' });
      
      done(assert.equal(result.css.toString(), 'test.sync{foo:4}\n'));
    });
  });
});