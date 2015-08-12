# Sassport
![Sassport logo](https://raw.githubusercontent.com/davidkpiano/sassport/master/sassport-sm.png)

JavaScript modules for Sass (node-sass). Easily share JavaScript functions and values in your Sass projects.

## Quick Start
1. `npm install sassport --save`
2. Use `sassport` just like you would use [Node-Sass](https://github.com/sass/node-sass#usage) (see example below)
3. Use `require()` in your Sass (SCSS) stylesheets to import JS values (see example below)
3. `node index.js`

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
  primary: '#C0FF33'
  secondary: '#B4D455'
};
```

```scss
// path/to/stylesheet.scss
$colors: require('path/to/my-colors'); // Just like Node require()!

.foo {
  color: map-get($colors, primary);
}
```

**Result:**
```css
.foo {
  color: #C0FF33;
}
```

## Using Sassport modules
Sassport modules can provide extra functionality and give you access to module-specific stylesheets. The syntax for including Sassport modules is very similar to [PostCSS' syntax](https://github.com/postcss/postcss#usage):

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
