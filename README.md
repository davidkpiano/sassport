# Sassport
Work in progress!

## Usage
Sassport works with any Sassport JavaScript module, even ones that you create specifically for your own project. To use Sassport, just follow these two steps:

1. Add Sassport to your build tool.
2. Include Sassport plugins, and use Sassport just as you would use `node-sass`.

```js
var sassport = require('sassport');
var sassportMath = require('sassport-math'); // sample plugin
var sassportTypography = require('sassport-typography'); // another sample plugin

var sassOptions = {
  file: 'index.scss',
  outputStyle: 'compressed'
};

sassport([ sassportMath, sassportTypography ])
  .render(sassOptions, function(err, result) { /* ... */ });
```

## Plugins
Sassport makes it easy to include JavaScript functions, variables, and assets such as images or other Sass files. You can use the Sassport API to create plugins, or wrap normal JavaScript functions with `sassport.wrap(...)`.

```js
var sassport = require('sassport');
var sass = require('sass');

module.exports = sassport.functions({
  'say-hello($message)': function(message) {
    return sass.types.String('Hello, ' + message.getValue() + '!!');
  }
});
```

```js
// Wrapping normal (non-Sassport) JavaScript functions
var sassport = require('sassport');

module.exports = sassport.functions({
  'say-hello($message)': sassport.wrap(function(message) {
    return 'Hello, ' + message + '!!!';
  }
});
```
    
