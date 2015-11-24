import sass from 'node-sass';
import gonzales from 'gonzales-pe';

export default function parse(contents) {
  let tree = gonzales.parse(contents, { syntax: 'scss' });
  let sels = [];

  dosel(tree);

  return tree.toString();
}

function dosel(node) {
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

  node.forEach(dosel);
}