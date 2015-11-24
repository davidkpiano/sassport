'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports['default'] = createImporter;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var _lodashCollectionFind = require('lodash/collection/find');

var _lodashCollectionFind2 = _interopRequireDefault(_lodashCollectionFind);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _ncp = require('ncp');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _utilsParser = require('./utils/parser');

var _utilsParser2 = _interopRequireDefault(_utilsParser);

var _utilsResolve = require('./utils/resolve');

var _utilsResolve2 = _interopRequireDefault(_utilsResolve);

function createImporter(sassportModule) {
  return function (url, prev, done) {
    var _url$split = url.split('!');

    var _url$split2 = _toArray(_url$split);

    var resolvedUrl = _url$split2[0];

    var transformers = _url$split2.slice(1);

    var filePath = undefined;

    if (transformers.length) {
      filePath = (0, _utilsResolve2['default'])(_path2['default'].dirname(prev), resolvedUrl)[0].absPath;

      return {
        contents: (0, _utilsParser2['default'])(_fs2['default'].readFileSync(filePath, { encoding: 'UTF-8' }))
      };
    }

    var _url$split3 = url.split('/');

    var _url$split32 = _toArray(_url$split3);

    var moduleName = _url$split32[0];

    var moduleImports = _url$split32.slice(1);

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

module.exports = exports['default'];