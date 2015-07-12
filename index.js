var sass = require('node-sass');
var sassport = require('./dist/index.js');
var _ = require('lodash');

var imageSize = require('image-size');

function camelCase(msg) {
  return _.camelCase(msg);
}

var foo = sassport.wrap(function(message) {
  return 'Hi, '+message+'!';
});

var say = sassport
  .module('say')
  .functions({
    'say($message)': function(message) {
      return sass.types.String(message.getValue() + '!!!');
    }
  })
  .exports('./imports.scss')
  .variables({
    '$test-again': 'a normal js string',
    '$color-primary': 'green',
    '$map': {
      foo: 'bar',
      baz: {
        quid: 'nunk'
      }
    },
    '$test-image': sassport.asset('./testimage.png', imageSize)
  })
  .rulesets([
    '.baz { color: black; &.bar { color: green; }}'
  ]);

say.functions({
  'foo($msg)': foo
});

var sassOptions = {
  file: './test.scss'
};

sassport([
  say
]).render(sassOptions, function(err, result) {
  console.log(err);
  console.log(result.css.toString());
});
