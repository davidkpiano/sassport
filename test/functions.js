var assert = require('assert');
var should = require('should');
var sass = require('node-sass');

var sassport = require('../dist/index.js');
var assertRenderSync = require('./util/assertRenderSync.js');

var sassportModule = sassport.module('test');

describe('Sassport.functions', function() {

  describe('unwrapped functions', function() {
    var sassportModule = sassport.module('test').functions({
      'foo($bar)': function(bar) {
        return sass.types.String('test ' + bar.getValue());
      }
    });

    it('should support unwrapped functions', function(done) {
      assertRenderSync(
        sassportModule,
        'test { test: foo("one"); }',
        'test{test:test one}\n',
        done);
    });
  });

  describe('wrapped functions', function() {
    var wrappedFunc = sassport.wrap(function(bar) {
      return 'wrap test ' + bar;
    });

    var sassportModule = sassport.module('test').functions({
      'foo-wrap($bar)': wrappedFunc
    });

    it('should support wrapped functions', function(done) {
      assertRenderSync(
        sassportModule,
        'test { test: foo-wrap("one"); }',
        'test{test:wrap test one}\n',
        done);
    });

  });

  describe('wrapped functions with done()', function(done) {
    var wrappedDoneFunc = sassport.wrap(function(bar, done) {
      setTimeout(function(){
        done('wrap done test ' + bar);
      }, 10);
    });

    var sassportModule = sassport.module('test').functions({
      'foo-wrap-done($bar)': wrappedDoneFunc
    });
    
    it('should allow done() to be called inside wrapped functions', function(done) {
      assertRenderSync(
        sassportModule,
        'test { test: foo-wrap-done("one"); }',
        'test{test:wrap done test one}\n',
        done);
    });
  });

  describe('functions from imported modules', function(done) {
    var sassportModule = sassport([ require('./fixtures/single-module.js') ]);

    it('should import functions from imported modules', function(done) {
      assertRenderSync(
        sassportModule,
        'test { unwrapped: single-unwrapped("foo"); wrapped: single-wrapped("bar"); }',
        'test{unwrapped:foo!!!;wrapped:bar!!!}\n',
        done);
    });
  });

  describe('overridden functions from imported modules', function(done) {
    var sassportModule = sassport([ require('./fixtures/single-module.js') ]);

    sassportModule.functions({
      'single-wrapped($val)': sassport.wrap(function(val) {
        return val + ' overridden';
      })
    });

    it('should overwrite imported functions from imported modules', function(done) {
      assertRenderSync(
        sassportModule,
        'test { unwrapped: single-unwrapped("foo"); wrapped: single-wrapped("bar"); }',
        'test{unwrapped:foo!!!;wrapped:bar overridden}\n',
        done);
    });
  });
});