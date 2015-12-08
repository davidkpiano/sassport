import sassport from '../index';

let imported = [];

const sassportOnce = sassport.module('once')
  .loaders({
    'once': (contents, meta, done) => {
      if (imported.indexOf(meta.absPath) !== -1) {
        return { contents: '' };
      }

      imported.push(meta.absPath);

      return { file: meta.absPath };
    }
  });

export default sassportOnce;