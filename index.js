var sass = require('node-sass');
var sassport = require('./dist/index.js');

var sassOptions = {
  file: './test.scss',
  functions: {
    'saypure($message)': sassport.plain(function(message) {
      return 'Hi, '+message+'!';
    })
  }
};

sass.render(sassOptions, function(err, result) {
  console.log(result.css.toString());
});