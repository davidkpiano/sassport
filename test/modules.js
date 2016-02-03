import assert from 'assert';
import should from 'should';
import sass from 'node-sass';

import sassport from '../dist/index.js';
import assertRenderSync from './util/assertRenderSync.js';

describe('Sassport.module', () => {

  describe('plugin module', () => {
    let sassportModule = sassport.module('test');

    it('should return a Sassport module instance (duck-typed)', (done) => {
      assert.equal(sassportModule.name, 'test');
      assert.ok(sassportModule.modules && sassportModule.modules.length === 0);
      assert.ok(sassportModule.sass);

      done();
    });
  });

  describe('root (consumer) module', () => {
    let testModule = sassport.module('test');
    let sassportModule = sassport([testModule]);

    it('should return a Sassport module instance (duck-typed)', (done) => {
      assert.ok(!sassportModule.name);
      assert.ok(sassportModule.modules);
      assert.ok(sassportModule.modules.length === 1);
      assert.equal(sassportModule.modules[0], testModule);
      assert.ok(sassportModule.sass);

      done();
    });
  });

  describe('sass.render', () => {
    let sassportModule = sassport([]);
    let testData = 'test.async { foo: 1 + 1; }'

    it('should render through sass.render', (done) => {
      sassportModule.render({ data: testData, outputStyle: 'compressed' }, function(err, result) {
        done(assert.equal(result.css.toString(), 'test.async{foo:2}\n'));
      });
    });
  });

  describe('sass.renderSync', () => {
    let sassportModule = sassport([]);
    let testData = 'test.sync { foo: 2 + 2; }'

    it('should render through sass.renderSync', (done) => {
      let result = sassportModule.renderSync({ data: testData, outputStyle: 'compressed' });
      
      done(assert.equal(result.css.toString(), 'test.sync{foo:4}\n'));
    });
  });

  describe('custom options', () => {
    it('should allow for custom includePaths', (done) => {
      let sassportModule = sassport();

      sassportModule.render({
        data: '@import "included-path";',
        includePaths: ['test/scss'],
        outputStyle: 'compressed'
      }, (err, result) => {
        assert.equal(result.css.toString(), 'test.included{foo:bar}\n');
        done();
      });
    });
  });
});
