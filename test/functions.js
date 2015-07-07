var assert = require('assert');
var should = require('should');
var sass = require('node-sass');

var sassport = require('../dist/index.js');

var sassportModule = sassport.module('test');


describe('Sassport.functions', function() {

  describe('unwrapped function', function() {
    var sassportModule = sassport.module('test').functions({
      'foo($bar)': function(bar) {
        return sass.types.String('test ' + bar.getValue());
      }
    });

    console.log(sassportModule.options.functions);

    it('should support unwrapped functions', function(done) {
      sassportModule.renderSync({
        data: 'test { test: foo("one"); }'
      }, function(err, result) {
        var actual = result.css.toString();
        var expected = 'test {\n  test: test one; }\n';

        done(assert.equal(actual, expected));
      });
    });
  });

  describe('wrapped function', function() {
    var wrappedFunc = sassport.wrap(function(bar) {
      return 'wrap test ' + bar;
    });

    var sassportModule = sassport.module('test').functions({
      'foo-wrap($bar)': wrappedFunc
    });

    console.log(sassportModule.options.functions);

    it('should support wrapped functions', function(done) {
      sassportModule.renderSync({
        data: 'test { test: foo-wrap("one"); }'
      }, function(err, result) {
        console.log(err);
        var actual = result.css.toString();
        var expected = 'test {\n  test: wrap test one; }\n';

        done(assert.equal(actual, expected));
      });
    });
  });
});