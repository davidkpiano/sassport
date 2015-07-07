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

module.exports = sassport.module('say')
  .functions({
    'say-hello($message)': function(message) {
      return sass.types.String('#{$hello-message}, ' + message.getValue() + '!!');
    },
    // Wrap plain JS functions!
    'say-goodbye($message)': sassport.wrap(function(message) {
      return 'Goodbye, ' + message + '!!';
    })
  })
  .exports({
    // @import 'say';
    default: __dirname + '/stylesheets/main.scss',
    
    // @import 'say/someMixins';
    'someMixins': __dirname + '/stylesheets/mixins',
    
    // @import 'say/otherClasses';
    'otherClasses': __dirname + '/stylesheets/classes'
  })
  .variables({
    // JS values are automatically cast to Sass values
    '$hello-message': 'Why hello there',
    '$hello-map': {
      foo: 'one',
      bar: 'two'
    }
  });
```

(Coming soon) You can also define custom mixins:

```js
sassport.module('hello-world')
  .mixins({
    'hello($message, $color)': function(message, color) {
      return `
        &:before {
          display: block;
          content: 'Hello, ${message}!';
          color: ${color};
        }
      `;
    }
  });
```
