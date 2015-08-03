
module.exports = function assertRenderSync(sassportModule, input, expected, done) {
  sassportModule.renderSync({
    data: input
  }, function(err, result) {
    if (err) console.error(err);

    var actual = result.css.toString();

    done(assert.equal(actual, expected));
  });
}