var assert = require('assert');
var should = require('should');
var sass = require('node-sass');
var path = require('path');
var _ = require('lodash');

import sassport from '../dist/index.js';
var assertRenderSync = require('./util/assertRenderSync.js');

var inferTest = require('./assets-test/infer-js-test.js');

describe('Sassport JS value inference', function() {
  var expected = _.map(inferTest, function(tests, sassType) {
    return sassType
      + '{'
      + _.map(tests, _.constant('test:' + sassType)).join(';')
      + '}';
  }).join('') + '\n';

  describe('usage with require()', function() {
    var sassportModule = sassport([], {
      infer: true
    }).assets(path.join(__dirname, 'assets-test'));

    it('should convert strings to their inferred Sass values ', function(done) {
      sassportModule.render({
        file: path.join(__dirname, 'scss/infer.scss'),
        outputStyle: 'compressed'
      }, function(err, result) {
        done(assert.equal(result.css.toString(), expected));
      });
    });
  });

  describe('require() with $infer option', function() {
    var sassportModule = sassport([])
      .assets(path.join(__dirname, 'assets-test'));

    it('should infer JS strings in require() when $infer = true', function(done){
      sassportModule.render({
        data:
          '$font-size: require("simple-js-test", "fontSize", true);'
          + '$primary-color: require("simple-js-test", "primaryColor", $infer: true);'
          + 'test {'
            + 'number: type-of($font-size);'
            + 'color: type-of($primary-color);'
          + '}',
        outputStyle: 'compressed'
      }, function(err, result) {
        done(assert.equal(result.css.toString(),
          'test{number:number;color:color}\n'));
      });
    })
  })
});