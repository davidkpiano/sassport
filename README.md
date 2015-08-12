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

