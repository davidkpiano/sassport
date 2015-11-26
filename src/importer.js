import find from 'lodash/collection/find';
import difference from 'lodash/array/difference';
import reduce from 'lodash/collection/reduce';
import path from 'path';
import mkdirp from 'mkdirp';
import { ncp } from 'ncp';
import fs from 'fs';
import resolve from './utils/resolve';

export default function createImporter(sassportModule) {
  return (url, prev, done) => {
    let [resolvedUrl, ...loaderKeys] = url.split('!')
      .map((part) => part.trim());

    if (loaderKeys.length) {
      let importPath = resolve(
        path.dirname(prev),
        resolvedUrl
      )[0].absPath;

      return transform(importPath, loaderKeys, sassportModule);
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

function transform(importPath, loaderKeys, spModule) {
  let loaders = spModule._loaders;
  let missingLoaders = difference(loaderKeys, Object.keys(loaders));

  if (missingLoaders.length) {
    throw new Error(`These loaders are missing:
      ${missingLoaders.join(', ')}`);
  } 

  let contents = fs.readFileSync(importPath, {
      encoding: 'UTF-8'
    });

  let transformedContents = reduce(loaderKeys, (contents, loader) => {
    try {
      return loaders[loader](contents);
    } catch (err) {
      throw new Error(`The "${loader}" failed when trying to transform this file:
        ${importPath}

        ${err}`);
    }
  }, contents);

  return {
    contents: transformedContents
  }
}