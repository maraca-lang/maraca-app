import maraca from 'maraca';
import render from 'maraca-render';

import '../style.css';

import appLibrary from './library';

let streams = {};
try {
  // @ts-ignore
  streams = require('../../../js/streams').default;
} catch {}
const config = {
  '@': streams['@'],
  '#': { ...appLibrary, ...(streams['#'] || {}) },
};

// @ts-ignore
const { start, ...modules } = FILES.reduce(
  // @ts-ignore
  (res, f) => ({ ...res, [f]: require(`../../../app/${f}.ma`).default }),
  {},
);

let components = {};
try {
  // @ts-ignore
  components = require('../../../js/components').default;
} catch {}

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

maraca([start, modules], config, render(components, root));
