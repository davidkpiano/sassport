let assert = require('assert');
let should = require('should');
let sass = require('node-sass');
let path = require('path');

let sassport = require('../dist/index.js');

xdescribe('Sassport load paths', function() {

  describe('standard usage', function() {
    it('should use default load paths', function(done) {
      let sassportModule = sassport([]);

      // comes from node_modules/sassdash/index.scss
      let testData = `
        @import 'sassdash/index';
      `;

      sassportModule.render({ data: testData, outputStyle: 'compressed' }, function(err, result) {
        err && console.error(err);

        done(assert.ok(result.css.toString()));
      });
    });
  });
});