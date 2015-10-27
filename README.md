# Sassport
![Sassport logo](https://raw.githubusercontent.com/davidkpiano/sassport/master/sassport-sm.png)

JavaScript modules for Sass (node-sass). Easily share assets, and JavaScript functions and values in your Sass projects.

- `npm install sassport --save-dev`
- `sassport([...]).render(...);`

## Available Plugins
- [gulp-sassport](https://github.com/davidkpiano/gulp-sassport)
- [sassport-loader](https://github.com/IngwiePhoenix/sassport-loader) for [Webpack](http://webpack.github.io/) (thanks to @IngwiePhoenix!)
- More to come soon!

## Quick Start
1. `npm install sassport --save-dev`
2. Use `sassport` just like you would use [Node-Sass](https://github.com/sass/node-sass#usage) (see example below)
3. Use `require()` in your Sass (SCSS) stylesheets to import JS values (see example below)
3. `node index.js`

**EXAMPLE:**
```js
// index.js
var sassport = require('sassport');

sassport().render({
  file: 'path/to/stylesheet.scss'
}, function(err, result) {
  console.log(result.css.toString());
  // ... or whatever you want to do with the result
});
```

```js
// path/to/my-colors.js
module.exports = {
  primary: '#C0FF33',
  secondary: '#B4D455'
};
```

```scss
// path/to/stylesheet.scss
$colors: require('path/to/my-colors'); // Just like Node require()!

.foo {
  color: map-get($colors, primary);
  
  &:hover {
    // Sassport uses inferred Sass values, not strings!
    color: lighten(map-get($colors, primary), 10%);
}
```

**Result:**
```css
.foo {
  color: #c0ff33;
}

.foo:hover {
  color: #d0ff66;
}
```

## Inspiration
Sassport was created to solve a few problems related to creating and maintaining Sass projects:
- How can values be shared between JavaScript and Sass?
- How can assets be easily included from 3rd-party modules, such as sprites, fonts, or other stylesheets?
- Can remote asset URLs easily be managed, without hard-coding them in the stylesheets? (Yes!)
- Can JavaScript functions be used inside Sass stylesheets? (Yes!)

The last question is especially important - it means that you can communicate with JavaScript from Sass to do complex tasks such as creating sprite sheets and receive useful information from the completed task's return value, such as image dimensions or sprite locations. With `sassport.wrap()`, it's possible to wrap entire JavaScript libraries for use inside your Sass project.

**Is this similar to [Sass Eyeglass](https://github.com/sass-eyeglass/eyeglass)?** Yes, and no. Both projects achieve similar goals, with different philosophies. Eyeglass is based on convention - 3rd-party Eyeglass modules must be configured to be _discoverable_ by Eyeglass via NPM. With Sassport, you _explicity_ state which Sassport plugins (modules) you're going to use, which can come from anywhere - NPM, Bower, or even your own project. This is very similar to how [PostCSS](https://github.com/postcss/postcss) works.

Sassport is also agnostic and simple with assets - its only job is to copy assets from the source folder to your project's assets folder (inside the `sassport-assets` subdirectory). With this, you can wrap _any_ plugin to transform your assets (see [examples](#examples) below). Sassport is not meant to be another asset management tool - Gulp, Grunt, Broccoli, etc. already exist for that.

## Using Sassport modules
Sassport modules can provide extra functionality and give you access to module-specific stylesheets. The syntax for including Sassport modules is very similar to [PostCSS' syntax](https://github.com/postcss/postcss#usage):

**EXAMPLE:**
```js
var sassport = require('sassport');

sassport([
  require('sassport-foo'), // example foo module
  require('sassport-bar')  // example bar module
]).render({
  file: 'path/to/stylesheet.scss'
}, function(err, result) { /* ... */ });
```

```scss
// path/to/stylesheet.scss
@import 'sassport-foo'; // imports default export(s)
                        // from sassport-foo module
@import 'sassport-bar'; 

@import 'sassport-bar/images'; // imports specific images export(s) 
                               // from sassport-bar module
```

When a Sassport module is included:
- Sass functions from that module get imported automatically.
- Sass variables and rulesets get imported when you `@import 'that-module'`.
- Specified exports get imported when you `@import 'that-module/specific-export'`.

## Managing Assets
To specify where your assets are, configure the asset paths by using the `.assets(localAssetPath, remoteAssetPath)` method. Then, you can use the Sass helper function `asset-url($source, $module: null)` to generate the remote URL path. The `$source` is relative to the provided `localAssetPath`.

**EXAMPLE:**
```js
var sassport = require('sassport');

sassport([ /* modules */ ])
  .assets(__dirname + '/assets', 'public/assets')
  .render(/* ... */);
```

```scss
.my-image {
  // Renders as:
  // background-image: url(public/assets/images/my-image.png);
  background-image: asset-url('images/my-image.png');
}
```

When you `@import` assets (files or directories) from a Sassport module, those get copied into the `sassport-assets/` subdirectory inside the provided `localAssetPath`. These assets can then be referenced in `asset-url()` by specifying the `$module` that it came from.

**EXAMPLE:**
```scss
@import 'foo-module/images';

.their-image {
  // Renders as:
  // background-image: url(public/assets/sassport-assets/images/their-image.png);
  background-image: asset-url('images/their-image.png', 'foo-module');
}
```

## Creating Sassport Modules
A Sassport module is created with `sassport.module(name)`. From there, you can use the below methods to configure your Sassport module:

- `.functions({...})` - Registers a collection of custom functions, just like in [Node-Sass](https://github.com/sass/node-sass#functions--v300---experimental), with the Sassport module.
- `.variables({...})` - Registers Sass `$variables` whose values can either be Sass values or JS values (converted to Sass values automatically).
- `.exports({...})` - Registers exports whose values are either file paths or directory paths to Sass stylesheets or assets.

**EXAMPLE:**
```js
var sassport = require('sassport');
var sass = require('node-sass');

module.exports = sassport.module('test')
  .functions({
    'greet($val)': function(val) {
      return sass.types.String('Hello, ' + val.getValue());
    },
    'greet-simple($value)': sassport.wrap(function(val) {
      return 'Hey, ' + val;
    })
  })
  .variables({
    '$a-number': 42,
    '$a-string': 'Sassport rocks!',
    '$a-list': [1, 2, 3, 4, 5],
    '$a-map': {a: 1, b: 2, c: 3}
  })
  .exports({
    'default': __dirname + '/stylesheets/main.scss', // @import 'test';
    'images': __dirname + '/images', // @import 'test/images';
  });
```

```scss
.greeting {
  test: greet('David'); // Hello, David
  test: greet-simple('David'); // Hey, David
}
```

With the `sassport.wrap(fn, options)` utility function, normal JS functions can be wrapped to automatically have arguments converted to JS values, and to automatically have the JS return value converted to Sass values using this conversion:

- `Number (Sass)` - converted to a _unitless_ JS number.
- `Number (JS)` - converted to a _unitless_ Sass number.
- `String (Sass)` - converted to a JS string.
- `String (JS)` - converted to an _unquoted_ Sass string, unless `{quotes: true}` is specified for the `options` object.
- `List (Sass)` - converted to a JS array.
- `Array (JS)` - converted to a Sass list.
- `Map (Sass)` - converted to a JS map-like object, with `.get(key)` and `.set(key, value)` methods.
- `Object (JS)` - converted to a Sass map.
- `Bool (Sass)` - converted to a JS boolean.
- `Boolean (JS)` - converted to a Sass boolean.
- `Null (Sass)` - converted to a JS `null` value.
- `null (JS)` - converted to a Sass `null` value.

Also, `sassport.utils` provides Chris Eppstein's excellent [node-sass-utils](https://github.com/sass-eyeglass/node-sass-utils) library.

## Value Inference
By default, Sassport automatically _infers_ Sass values from JavaScript strings. This means that you can seamlessly share CSS-like or (Sass-like) values as strings between JS and Sass, and Sassport will hand them over to sass as their *inferred values*, not as strings. For example:

- `"235px"` becomes a Sass number with a `px` unit
- `"#C0FF33"` becomes a Sass color (that looks nothing like coffee)
- `"3rem + 5rem"` becomes a Sass number with value `8rem` and a `rem` unit
- `"rebeccapurple"` becomes a Sass color (yes, color keywords are understood)
- `"3px 5rem 0 auto"` becomes a Sass list
- `"(a: 1, b: 2)"` becomes a Sass map

To turn this option off, set `infer` to `false` as an option: `sassport([...], { infer: false }).render(...)`. If you do this, you can selectively use inference in custom wrapped functions: `sassport.wrap(fn, { infer: true });`, or as a param in the Sass `require()` function as `$infer: true`.

## Examples

### Getting image dimensions
**TERMINAL**
```bash
npm install sassport image-size --save-dev
```

**JAVASCRIPT**
```js
// index.js
var sassport = require('sassport');
var sizeOf = require('image-size');

sassport()
  .functions({
    'size-of($path)': sassport.wrap(function(path) {
      return sizeOf(path);
    })
  })
  .assets('./assets', 'public/assets')
  .render({
    file: 'stylesheet.scss'
  }, function(err, res) {
    console.log(res.css.toString());
  });
```

**SCSS**
```scss
// stylesheet.scss
$image-path: 'sassport-sm.png';
$image-size: size-of(asset-path($image-path));

.my-image {
  background-image: asset-url($image-path);
  width: map-get($image-size, 'width') * 1px;
  height: map-get($image-size, 'height') * 1px;
}
```

**RESULT (CSS)**
```css
.my-image {
  background-image: url(public/assets/sassport-sm.png);
  width: 145px;
  height: 175px;
}
```
