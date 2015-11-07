var sassport = require('../dist/index.js');
var sizeOf = require('image-size');

sassport()
  .assets(__dirname + '/assets-test', 'remote/assets')
  .functions({
    'size-of($path)': sassport.wrap(function(path) {
      return sizeOf(path);
    })
  })
  .render({
    data: 'test { path: inspect(size-of(asset-path("sassport-sm.png"))) }'
  }, function(err, res) {
    console.error(err);
    console.log(res.css.toString());
  });