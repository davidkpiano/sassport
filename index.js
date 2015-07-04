var sass = require('node-sass');
var sassport = require('./dist/index.js');
var _ = require('lodash');

function camelCase(msg) {
  return _.camelCase(msg);
}

var foo = sassport.wrap(function(message) {
  return 'Hi, '+message+'!';
});

var say = sassport.functions({
  'say($message)': function(message) {
    return sass.types.String(message.getValue() + '!!!');
  }
});

var saypure = sassport.functions({
  'saypure($message)': sassport.wrap(function(message) {
    return 'Hi, '+message+'!';
  })
});

var sassOptions = {
  file: './test.scss'
};

sassport([
  saypure,
  say,
  camelCase
]).render(sassOptions, function(err, result) {
  console.log(err);
  console.log(result.css.toString());
});
