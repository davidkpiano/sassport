var assert = require('assert');
var should = require('should');
var sass = require('node-sass');

import sassport from '../dist/index.js';
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

    var wrappedNumberFunc = sassport.wrap(function(val) {
      return 3 + val;
    });

    var wrappedMapFunc = sassport.wrap(function(val) {
      return val.get('foo');
    });

    var wrappedMapSetFunc = sassport.wrap(function(val) {
      return val.set('baz', 42);
    });

    var wrappedListFunc = sassport.wrap(function(val) {
      return val[3];
    });

    var sassportModule = sassport.module('test').functions({
      'foo-wrap($bar)': wrappedFunc,
      'number-wrap($val)': wrappedNumberFunc,
      'map-wrap($val)': wrappedMapFunc,
      'map-set-wrap($val)': wrappedMapSetFunc,
      'list-wrap($val)': wrappedListFunc
    });

    it('should support wrapped functions', function(done) {
      assertRenderSync(
        sassportModule,
        'test { '
        + 'test: foo-wrap("one");'
        + 'num: number-wrap(5);'
        + 'map: map-wrap((a: 1, b: 2, foo: bar));'
        + 'map-set: map-get(map-set-wrap((a: 1, b: 2)), baz);'
        + 'list: list-wrap(10 12 14 42 18); }',
        'test{test:wrap test one;num:8;map:bar;map-set:42;list:42}\n',
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

  describe('wrapped functions with options', function(done) {
    var sassportModule = sassport([ require('./fixtures/single-module.js') ]);

    it('should properly quote a string with "quotes" option', function(done) {
      assertRenderSync(
        sassportModule,
        'test { quoted: wrapped-options("foo"); }',
        'test{quoted:"foo quoted"}\n',
        done);
    });
  });

  describe('functions with wrapAll()', (done) => {
    let sassportModule = sassport.module('test').functions({
      'Math($key, $args...)': sassport.wrapAll(Math)
    });

    let fooModule = sassport.module('foo')
      .functions({
        'Foo($key, $args...)': sassport.wrapAll({
          someValue: 'hello world',
          someFn: (a, b) => a + b
        })
      });

    let barModule = sassport.module('bar')
      .functions({
        'Bar($key, $args...)': sassport.wrapAll({
          someValue: 'hello world',
          someFn: (a, b) => a + b
        }, {
          quotes: true
        })
      });

    it('should wrap all methods of an object to be callable by the parent Sass function', (done) => {
      assertRenderSync(
        sassportModule,
        'test { test: Math(pow, 2, 2) }',
        'test{test:4}\n',
        done);
    });

    it('should return a value and ignore extra arguments if key refers to object property', (done) => {
      assertRenderSync(
        fooModule,
        `
          test {
            val: Foo(someValue);
            val-extra: Foo(someValue, 1, 2, 3);
            fn-num: Foo(someFn, 1, 2);
            fn-string: Foo(someFn, 'foo', 'bar');
          }
        `,
        'test{val:hello world;val-extra:hello world;fn-num:3;fn-string:foobar}\n',
        done);
    });

    it('should pass options to sassport.wrap()', (done) => {
      assertRenderSync(
        barModule,
        `
          test {
            val: Bar(someValue);
            val-extra: Bar(someValue, 1, 2, 3);
            fn-num: Bar(someFn, 1, 2);
            fn-string: Bar(someFn, 'foo', 'bar');
          }
        `,
        'test{val:"hello world";val-extra:"hello world";fn-num:3;fn-string:"foobar"}\n',
        done);
    });
  });
});

