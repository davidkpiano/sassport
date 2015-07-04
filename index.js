var sass = require('node-sass');
var sassport = require('./dist/index.js');
var _ = require('lodash');

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
  .exports('imports.scss');

var saypure = sassport.module('pure').functions({
  'saypure($message)': sassport.wrap(function(message) {
    return 'Hi, '+message+'!';
  })
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
