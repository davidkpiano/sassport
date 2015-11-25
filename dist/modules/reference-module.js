'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _indexJs = require('../index.js');

var _indexJs2 = _interopRequireDefault(_indexJs);

var _nodeSass = require('node-sass');

var _nodeSass2 = _interopRequireDefault(_nodeSass);

var _gonzalesPe = require('gonzales-pe');

var _gonzalesPe2 = _interopRequireDefault(_gonzalesPe);

var referenceModule = _indexJs2['default'].module('reference').functions({
  'reference($selector)': function reference$selector(selector, done) {
    var selectorString = selector.getValue();

    var result = transformSelector(selectorString);

    return _nodeSass2['default'].types.String(result);
  }
}).loaders({
  'reference': function reference(contents, options, done) {
    var tree = _gonzalesPe2['default'].parse(contents, {
      syntax: 'scss',
      context: 'stylesheet'
    });

    transformSelectors(tree);

    return tree.toString();
  }
});

var referenceLoader = function referenceLoader(contents, done) {
  var tree = _gonzalesPe2['default'].parse(contents, {
    syntax: 'scss'
  });

  transformSelectors(tree);

  return tree.toString();
};

var transformSelectors = function transformSelectors(node) {
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

  node.forEach(transformSelectors);
};

var transformSelector = function transformSelector(selector) {
  var tree = _gonzalesPe2['default'].parse(selector, {
    syntax: 'scss',
    context: 'selector'
  });

  transformSelectors(tree);

  return tree.toString();
};

exports['default'] = referenceModule;
module.exports = exports['default'];