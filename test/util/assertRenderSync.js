var assert = require('assert');
var should = require('should');

module.exports = function(sassportModule, input, expected, done) {
  sassportModule.renderSync({
    data: input,
    outputStyle: 'compressed'
  }, function(err, result) {
    if (err) console.error(err);

    console.log(result.css.toString());

    var actual = result.css.toString();

    done(assert.equal(actual, expected));
  });
};