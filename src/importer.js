import find from 'lodash/collection/find';
import path from 'path';
import mkdirp from 'mkdirp';
import { ncp } from 'ncp';
import fs from 'fs';
import parser from './utils/parser';
import resolve from './utils/resolve';

export default function createImporter(sassportModule) {
  return (url, prev, done) => {
    let [resolvedUrl, ...transformers] = url.split('!');
    let filePath;

    if (transformers.length) {
      filePath = resolve(path.dirname(prev), resolvedUrl)[0].absPath;

      return {
        contents: parser(fs.readFileSync(filePath, {encoding: 'UTF-8'}))
      }
    }


    let [ moduleName, ...moduleImports ] = url.split('/');
    let spModule = null;
    let exportMeta;
    let importerData = {
      contents: ''
    };

    // Find submodule within modules
    spModule = find(sassportModule.options.sassportModules, (childModule) => {
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
        importerData.contents = fs.readFileSync(exportMeta.file);
      }
    }

    if (exportMeta.contents && exportMeta.contents.length) {
      importerData.contents += exportMeta.contents.join('');
    }

    if (exportMeta.directory) {
      let assetDirPath = path.join(spModule._localAssetPath, moduleName, moduleImports[0]);

      mkdirp(assetDirPath, (err, res) => {
        if (err) console.error(err);

        ncp(exportMeta.directory, assetDirPath, (err, res) => {
          done(importerData);
        });
      });
    } else {
      done(importerData);
    }
  }
}