'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = resolve;

var _find = require('lodash/collection/find');

var _find2 = _interopRequireDefault(_find);

var _flatten = require('lodash/array/flatten');

var _flatten2 = _interopRequireDefault(_flatten);

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _mkdirp = require('mkdirp');

var _mkdirp2 = _interopRequireDefault(_mkdirp);

var _ncp = require('ncp');

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SassQueued = function SassQueued(loadPath, absPath, source) {
  _classCallCheck(this, SassQueued);

  this.loadPath = loadPath;
  this.absPath = absPath;
  this.source = source;
};

function fileExists(filePath) {
  try {
    return _fs2.default.statSync(filePath).isFile();
  } catch (e) {
    if (e.code === 'ENOENT') {
      return false;
    }
  }
}

function resolve(rootPath, filePath) {
  var exts = ['.scss', '.sass', '.css'];
  var indexFileNames = ['/index', '/_index'];
  var fullExts = exts.concat((0, _flatten2.default)(exts.map(function (ext) {
    return indexFileNames.map(function (iExt) {
      return iExt + ext;
    });
  })));

  var filename = _path2.default.join(rootPath, filePath);
  var resolved = [];
  var base = _path2.default.dirname(filePath);
  var name = _path2.default.basename(filePath);

  // create full path (maybe relative)
  var relPath = _path2.default.join(base, name);
  var absPath = _path2.default.join(rootPath, relPath);

  var rawResolve = new SassQueued(relPath, absPath, 0);

  if (fileExists(absPath)) {
    resolved.push(new SassQueued(relPath, absPath, 0));
  }

  // next test variation with underscore
  relPath = _path2.default.join(base, '_' + name);
  absPath = _path2.default.join(rootPath, relPath);

  if (fileExists(absPath)) {
    resolved.push(new SassQueued(relPath, absPath, 0));
  }

  // next test fullExts plus underscore
  exts.forEach(function (ext) {
    relPath = _path2.default.join(base, '_' + name + ext);
    absPath = _path2.default.join(rootPath, relPath);

    if (fileExists(absPath)) {
      resolved.push(new SassQueued(relPath, absPath, 0));
    }
  });

  // next test plain name with fullExts
  fullExts.forEach(function (ext) {
    relPath = _path2.default.join(base, '' + name + ext);
    absPath = _path2.default.join(rootPath, relPath);

    if (fileExists(absPath)) {
      resolved.push(new SassQueued(relPath, absPath, 0));
    }
  });

  if (!resolved.length) {
    resolved.push(rawResolve);
  }

  return resolved;
}