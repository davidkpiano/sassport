var assert = require('assert');
var should = require('should');
var sass = require('node-sass');

var sassport = require('../dist/index.js');

function assertRenderSync(sassportModule, input, expected, done) {
  sassportModule.renderSync({
    data: input,
    outputStyle: 'compressed'
  }, function(err, result) {
    if (err) console.error(err);

    console.log(result.css.toString());

    var actual = result.css.toString();

    done(assert.equal(actual, expected));
  });
}

describe('Sassport.variables', function() {

  describe('standard JS types', function() {
    var sassportModule = sassport.module('test');

    sassportModule.variables({
      '$string': 'foobar',
      '$number': 123.456,
      '$list': ['a', 'b', 'c'],
      '$map': { a: 1, b: 2, c: 3 },
      '$boolean': false 
    });

    it('should convert plain JS variable types to Sass values', function(done) {    
      assertRenderSync(
        sassportModule,
        '@import "test"; test { string: inspect($string); number: inspect($number); list: inspect($list); map: inspect($map); }',
        'test{string:foobar;number:123.456;list:a, b, c;map:(a: 1, b: 2, c: 3)}\n',
        done);
    });
  });
});