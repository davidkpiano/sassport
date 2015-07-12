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

## Assets
With Sassport, you can include any type of asset (such as images, JSON data, etc.) for use in your Sass project. Each asset is transformed into a Sass map with useful meta data about the asset. You can also provide custom asset functions/transformers. There's two ways to include an asset:

* As a Sass `$variable`, with `sassport.asset(file, url, transformer)`
* As a Sassport asset, available in Sass via `sassport-asset($module, $asset);`

```js
// As as Sass $variable
sassport([ ... ])
  .variables({
    '$image-foo': sassport.asset('./images/foo.png', 'public/images/foo.png', require('image-size'))
  })
  .render( ... );
  
// As a Sassport asset
// * RECOMMENDED for Sassport modules
sassport([ ... ])
  .module('test')
  .assets({
    'image-bar': sassport.asset('./images/bar.png', 'public/images/bar.png', require('image-size'))
  });
```

```scss
@import 'test';

img.foo {
  width: map-get($image-foo, width);
  height: map-get($image-foo, height);
}

img.bar {
  width: map-get(sassport-asset('test', 'image-bar'), width);
  height: map-get(sassport-asset('test', 'image-bar'), height);
}
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


