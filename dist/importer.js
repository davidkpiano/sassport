'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createImporter;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var _lodashCollectionFind = require('lodash/collection/find');

var _lodashCollectionFind2 = _interopRequireDefault(_lodashCollectionFind);

var _lodashArrayDifference = require('lodash/array/difference');

var _lodashArrayDifference2 = _interopRequireDefault(_lodashArrayDifference);

var _lodashCollectionReduce = require('lodash/collection/reduce');

var _lodashCollectionReduce2 = _interopRequireDefault(_lodashCollectionReduce);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _ncp = require('ncp');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _utilsResolve = require('./utils/resolve');

var _utilsResolve2 = _interopRequireDefault(_utilsResolve);

function createImporter(sassportModule) {
  return function (url, prev, done) {
    var _url$split$map = url.split('!').map(function (part) {
      return part.trim();
    });

    var _url$split$map2 = _toArray(_url$split$map);

    var resolvedUrl = _url$split$map2[0];

    var loaderKeys = _url$split$map2.slice(1);

    if (loaderKeys.length) {
      var importPath = (0, _utilsResolve2['default'])(_path2['default'].dirname(prev), resolvedUrl)[0].absPath;

      return transform(importPath, loaderKeys, sassportModule);
    }

    var _url$split = url.split('/');

    var _url$split2 = _toArray(_url$split);

    var moduleName = _url$split2[0];

    var moduleImports = _url$split2.slice(1);

    var spModule = null;
    var exportMeta = undefined;
    var importerData = {
      contents: ''
    };

    // Find submodule within modules
    spModule = (0, _lodashCollectionFind2['default'])(sassportModule.options.sassportModules, function (childModule) {
      return childModule.name === moduleName;
    });

    // If module not found, return previous resolved path.
    if (!spModule) {
      return prev;
    }

    exportMeta = spModule._exportMeta;

    if (moduleImports.length) {
      exportMeta = spModule._exports[moduleImports[0]];
    }

    if (exportMeta.file) {
      if (!exportMeta.contents || !exportMeta.contents.length) {
        importerData.file = exportMeta.file;

        delete importerData.contents;
      } else {
        importerData.contents = _fs2['default'].readFileSync(exportMeta.file);
      }
    }

    if (exportMeta.contents && exportMeta.contents.length) {
      importerData.contents += exportMeta.contents.join('');
    }

    if (exportMeta.directory) {
      (function () {
        var assetDirPath = _path2['default'].join(spModule._localAssetPath, moduleName, moduleImports[0]);

        (0, _mkdirp2['default'])(assetDirPath, function (err, res) {
          if (err) console.error(err);

          (0, _ncp.ncp)(exportMeta.directory, assetDirPath, function (err, res) {
            done(importerData);
          });
        });
      })();
    } else {
      done(importerData);
    }
  };
}

function transform(importPath, loaderKeys, spModule) {
  var loaders = spModule._loaders;
  var missingLoaders = (0, _lodashArrayDifference2['default'])(loaderKeys, Object.keys(loaders));

  if (missingLoaders.length) {
    throw new Error('These loaders are missing:\n      ' + missingLoaders.join(', '));
  }

  var contents = _fs2['default'].readFileSync(importPath, {
    encoding: 'UTF-8'
  });

  var transformedContents = (0, _lodashCollectionReduce2['default'])(loaderKeys, function (contents, loader) {
    try {
      return loaders[loader](contents);
    } catch (err) {
      throw new Error('The "' + loader + '" failed when trying to transform this file:\n        ' + importPath + '\n\n        ' + err);
    }
  }, contents);

  return {
    contents: transformedContents
  };
}
module.exports = exports['default'];