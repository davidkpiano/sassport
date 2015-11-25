'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = referenceImporter;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _gonzalesPe = require('gonzales-pe');

var _gonzalesPe2 = _interopRequireDefault(_gonzalesPe);

function referenceImporter(url, prev, done) {
  var tree = _gonzalesPe2['default'].parse(contents, { syntax: 'scss' });
  var sels = [];

  dosel(tree);

  return tree.toString();
}

function dosel(node) {
  node.eachFor('class', function (subnode) {
    subnode.type = 'placeholder';

    subnode.eachFor('ident', function (subsubnode) {
      subsubnode.content = 'CLASS-' + subsubnode.content;
    });
  });

  node.eachFor('id', function (subnode) {
    subnode.type = 'placeholder';

    subnode.eachFor('ident', function (subsubnode) {
      subsubnode.content = 'ID-' + subsubnode.content;
    });
  });

  node.forEach(dosel);
}
module.exports = exports['default'];