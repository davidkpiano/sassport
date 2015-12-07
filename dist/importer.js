'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createImporter;

var _find = require('lodash/collection/find');

var _find2 = _interopRequireDefault(_find);

var _difference = require('lodash/array/difference');

var _difference2 = _interopRequireDefault(_difference);

var _reduce = require('lodash/collection/reduce');

var _reduce2 = _interopRequireDefault(_reduce);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _ncp = require('ncp');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _resolve = require('./utils/resolve');

var _resolve2 = _interopRequireDefault(_resolve);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function createImporter(sassportModule) {
  return function (url, prev, done) {
    var _url$split$map = url.split('!').map(function (part) {
      return part.trim();
    });

    var _url$split$map2 = _toArray(_url$split$map);

    var importUrl = _url$split$map2[0];

    var loaderKeys = _url$split$map2.slice(1);

    var queuedResolve = (0, _resolve2.default)(_path2.default.dirname(prev), importUrl);

    if (loaderKeys.length) {
      return transform(queuedResolve, loaderKeys, sassportModule, done);
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
    spModule = (0, _find2.default)(sassportModule.options.sassportModules, function (childModule) {
      return childModule.name === moduleName;
    });

    // If module not found, return previous resolved path.
    if (!spModule) {
      return { file: queuedResolve[0].absPath };
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
        importerData.contents = _fs2.default.readFileSync(exportMeta.file);
      }
    }

    if (exportMeta.contents && exportMeta.contents.length) {
      importerData.contents += exportMeta.contents.join('');
    }

    if (exportMeta.directory) {
      (function () {
        var assetDirPath = _path2.default.join(spModule._localAssetPath, moduleName, moduleImports[0]);

        (0, _mkdirp2.default)(assetDirPath, function (err, res) {
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

function transform(queuedResolve, loaderKeys, spModule, done) {
  var loaders = spModule._loaders;
  var missingLoaders = (0, _difference2.default)(loaderKeys, Object.keys(loaders));
  var contents = null;
  var importPath = queuedResolve[0].absPath;

  if (missingLoaders.length) {
    throw new Error('These loaders are missing:\n      ' + missingLoaders.join(', '));
  }

  try {
    contents = _fs2.default.readFileSync(importPath, {
      encoding: 'UTF-8'
    });
  } catch (e) {
    console.log('WARNING: import path "' + importPath + '" could not be read.');
  }

  function innerDone(contents) {
    if (!loaderKeys.length) {
      return done({ contents: contents });
    }

    var loaderKey = loaderKeys.shift();

    try {
      var transformedContents = loaders[loaderKey](contents, queuedResolve, innerDone);

      if (typeof transformedContents !== 'undefined') {
        innerDone(transformedContents);
      }
    } catch (err) {
      throw new Error('The "' + loaderKey + '" failed when trying to transform this file:\n        ' + importPath + '\n\n        ' + err);
    }
  }

  innerDone(contents);
}