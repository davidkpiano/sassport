import sassport from '../index.js';
import sass from 'node-sass';
import gonzales from 'gonzales-pe';

const referenceModule = sassport.module('reference')
  .functions({
    'reference($selector)': (selector, done) => {
      let selectorString = selector.getValue();

      let result = transformSelector(selectorString);

      return sass.types.String(result);
    }
  })
  .loaders({
    'reference': (contents, options, done) => {
      let tree = gonzales.parse(contents, {
        syntax: 'scss',
        context: 'stylesheet'
      });

      transformSelectors(tree);

      return tree.toString();
    }
  });

const referenceLoader = (contents, done) => {
  let tree = gonzales.parse(contents, {
    syntax: 'scss'
  });

  transformSelectors(tree);

  return tree.toString();
}

const transformSelectors = (node) => {
  node.eachFor('class', (subnode) => {
    subnode.type = 'placeholder';

    subnode.eachFor('ident', (subsubnode) => {
      subsubnode.content = `CLASS-${subsubnode.content}`;
    });
  });

  node.eachFor('id', (subnode) => {
    subnode.type = 'placeholder';

    subnode.eachFor('ident', (subsubnode) => {
      subsubnode.content = `ID-${subsubnode.content}`;
    });
  });

  node.forEach(transformSelectors);
}

const transformSelector = (selector) => {
  let tree = gonzales.parse(selector, {
    syntax: 'scss',
    context: 'selector'
  });

  transformSelectors(tree);

  return tree.toString();
}

export default referenceModule;