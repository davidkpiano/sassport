var assert = require('chai').assert;
var should = require('should');

var sassport = require('../dist/index.js');
var referenceModule = require('../dist/modules/reference-module');

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
        'foo': (content) => `${content} foo{test:foo}`,
        'bar': (content) => `${content} bar{test:bar}`,
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
});