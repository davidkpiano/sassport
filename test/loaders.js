var assert = require('chai').assert;
var should = require('should');

import sassport from '../dist/index.js';
import referenceModule from '../dist/modules/reference';

describe('Sassport loaders', () => {

  it('should register loaders from modules containing loaders', () => {
    let sassportModule = sassport([ referenceModule ]);

    assert.include(
      Object.keys(sassportModule._loaders),
      'reference'
    );

    assert.include(
      Object.keys(sassportModule.options.functions),
      'reference($selector)'
    );
  });


  it('should handle transformers', (done) => {
    let sassportModule = sassport([ referenceModule ]);

    sassportModule.render({
      file: './test/scss/index.scss',
      outputStyle: 'compressed'
    }, (err, result) => {
      console.error(err);
      console.log(result.css.toString());
      
      done(assert.equal(
        result.css.toString(),
        '.foo{color:black}.foo{color:green}.bar{color:blue}\n'
      ));
    });
  });

  it('should handle multiple transformers', (done) => {
    let testModule = sassport.module('testModule')
      .loaders({
        'foo': (contents) => ({ contents: `${contents} foo{test:foo}` }),
        'bar': (contents) => ({ contents: `${contents} bar{test:bar}` }),
      });

    let sassportModule = sassport([ testModule ]);

    sassportModule.render({
      data: `
        @import './test/scss/simple !foo !bar';
      `,
      outputStyle: 'compressed'
    }, (err, result) => {
      console.error(err);

      done(assert.equal(
        result.css.toString(),
        'a{b:c}foo{test:foo}bar{test:bar}\n'));
    });
  });

  it('should contain a reference to the sassportModule context in the loader options', (done) => {
    let sassportModule = sassport.module('test')
      .loaders({
        'foo': (contents, options) => {
          done(assert.equal(sassportModule, options.context));

          return {
            contents: `test { test: ${options.context.name} }`
          }
        }
      });

    sassportModule.render({
      data: '@import "test !foo";',
      outputStyle: 'compressed'
    }, (err, result) => {
      console.error(err);
      console.log(result.css.toString());
    });
  });
});

describe('Sassport once loader', () => {
  it('should only load imports once', (done) => {
    let sassportModule = sassport([ require('../dist/modules/once').default ]);

    sassportModule.render({
      data: `
        @import './test/scss/simple !once';
        @import './test/scss/simple !once';
      `,
      outputStyle: 'compressed'
    }, (err, result) => {
      console.error(err);

      done(assert.equal(
        result.css.toString(),
        'a{b:c}\n'));
    });
  });
})
