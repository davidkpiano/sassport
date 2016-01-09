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
    let [importUrl, ...loaderKeys] = url.split('!')
      .map((part) => part.trim());

    let queuedResolve = resolve(
      path.dirname(prev),
      importUrl
    );

    if (loaderKeys.length) {
      try {
        return transform(queuedResolve, loaderKeys, sassportModule, done);
      } catch (err) {
        console.error(err);
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

function transform(queuedResolve, loaderKeys, spModule, done) {
  let loaders = spModule._loaders;
  let missingLoaders = difference(loaderKeys, Object.keys(loaders));
  let importPath = queuedResolve[0].absPath;

  if (missingLoaders.length) {
    throw new Error(`These loaders are missing:
      ${missingLoaders.join(', ')}`);
  } 


  function innerDone(data) {
    let contents = null;

    if (!loaderKeys.length) {
      return done(data);
    }

    if (data.file) {    
      try {
        contents = fs.readFileSync(data.file, {
            encoding: 'UTF-8'
          });
      } catch(e) {
        console.log(`WARNING: import path "${importPath}" could not be read.`);
      }
    } else if (data.contents) {
      contents = data.contents;
    }

    let loaderKey = loaderKeys.shift();

    try {
      let loaderOptions = {
        ...queuedResolve[0],
        context: spModule
      };

      let transformedData = loaders[loaderKey](contents, loaderOptions, innerDone);

      if (typeof transformedData !== 'undefined') {
        innerDone(transformedData);
      }
    } catch (err) {
      throw new Error(`The "${loaderKey}" loader failed when trying to transform this file:
        ${importPath}

        ${err}`);
    }
  }

  try {
    innerDone({ file: importPath });
  } catch (err) {
    throw err;
  }
}
