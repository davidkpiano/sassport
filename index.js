var sass = require('node-sass');
var sassport = require('./dist/index.js');
var _ = require('lodash');

var fs = require('fs');
var Imagemin = require('imagemin');
var path = require('path');
 
var imageSize = function(url){
  return require('image-size')(url);
};

var sassportImageMin = function(url, done) {
  url = url.getValue();

  var img = new Imagemin().src(url).run(function(err, files) {
    console.log(files);
    done(files);
  });
}

function camelCase(msg) {
  return _.camelCase(msg);
}

var foo = sassport.wrap(function(message, done) {
  done('Hiyeo, '+message+'!!!!');
});

var say = sassport
  .module('say')
  .functions({
    'say($message)': function(message) {
      return sass.types.String(message.getValue() + '!!!');
    },
    'image-size($image)': sassport.wrap(imageSize),
    'image-min($image)': sassport.asset(sassportImageMin)
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
    }
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
