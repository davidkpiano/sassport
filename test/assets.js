var assert = require('assert');
var should = require('should');
var sass = require('node-sass');
var path = require('path');
var fs = require('fs');
var rimraf = require('rimraf');

var sassport = require('../dist/index.js');
var assertRenderSync = require('./util/assertRenderSync.js');


describe('Sassport.assets', function() {
  var localAssetPath = path.join(__dirname, 'assets-test');
  var moduleAssetPath = path.join(__dirname, 'module-assets');
  var remoteAssetPath = '/remote/assets-test';


  describe('asset() module method', function() {
    
    var sassportModule = sassport
      .module('test')
      .assets(localAssetPath, remoteAssetPath);

    after(function(done) {
      rimraf(path.join(__dirname, 'assets-test', 'sassport-assets'), function() {
        done();
      });
    });

    it('should set the module._localAssetPath', function(done) {
      var expected = path.join(localAssetPath, 'sassport-assets');

      done(assert.equal(sassportModule._localAssetPath, expected));
    });

    it('should set the module._remoteAssetPath', function(done) {
      var expected = remoteAssetPath;

      done(assert.equal(sassportModule._remoteAssetPath, expected));
    });

    it('should create the module._localAssetPath directory', function(done) {
      var expectedPath = path.join(localAssetPath, 'sassport-assets');
      fs.open(expectedPath, 'r', function(err, result) {
        done(assert.ok(!(err && err.code === 'ENOENT')));
      });
    });
  });

  describe('assets via export() module method', function() {
    var testModule = sassport
      .module('test')
      .exports({
        default: path.join(moduleAssetPath, 'default-imgs'),
        foo: path.join(moduleAssetPath, 'foo-imgs')
      });

    after(function(done) {
      rimraf(path.join(__dirname, 'assets-test', 'sassport-assets'), function() {
        done();
      });
    });

    it('should create the default imported module directory', function(done) {
      var sassportModule = sassport([testModule])
        .assets(localAssetPath, remoteAssetPath);

      sassportModule.render({
        data: '@import "test/default";'
      }, function(err, result) {
        var importedDirExists = fs.lstatSync(path.join(
          localAssetPath,
          'sassport-assets',
          'test',
          'default')).isDirectory();

        done(assert.ok(importedDirExists));
      });
    });

    it('should create imported module subdirectories', function(done) {
      var sassportModule = sassport([testModule])
        .assets(localAssetPath, remoteAssetPath);
        
      sassportModule.render({
        data: '@import "test/foo";'
      }, function(err, result) {
        var importedDirExists = fs.lstatSync(path.join(
          localAssetPath,
          'sassport-assets',
          'test',
          'foo')).isDirectory();

        done(assert.ok(importedDirExists));
      });
    });
  });
});