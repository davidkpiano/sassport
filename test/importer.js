var assert = require('assert');
var should = require('should');

import sassport from '../dist/index.js';

describe('Sassport custom importer', function() {

  it('should allow a custom importer to override the default importer', (done) => {
    let sassportModule = sassport([]);

    let customImporter = (url, prev) => ({
      contents: `test { test: ${url}; }`
    });

    sassportModule.render({
      data: `
        @import 'foobar';
      `,
      importer: customImporter,
      outputStyle: 'compressed'
    }, (err, result) => {
      done(assert.equal(
        result.css.toString(),
        'test{test:foobar}\n'
      ));
    });
  });
});