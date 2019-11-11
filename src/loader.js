const maraca = require('maraca').default;

const script = config => `

const maraca = require('maraca').default;
const render = require('maraca-render').default;

require('./style.css');

const app = require.context('./${
  typeof config.app === 'string' ? config.app : 'app'
}', true, /\.ma$/);
const { start, ...modules } = app
  .keys()
  .reduce((res, k) => ({ ...res, [k.slice(2, -3)]: app(k).default }), {});

const library = require('./library').default;
const streams = ${
  typeof config.streams === 'string'
    ? `require(./${config.streams}).default`
    : '{}'
};

const config = {
  '@': streams['@'] || [],
  '#': { ...library, ...(streams['#'] || {}) },
};

const components = ${
  typeof config.components === 'string'
    ? `require(./${config.components}).default`
    : '{}'
};

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

maraca([start, modules], config, render(root, components));

`;

const dataToObj = data =>
  data.type === 'value'
    ? data.value
    : data.value.reduce(
        (res, { key, value }) =>
          key.type === 'list' ? res : { ...res, [key.value]: dataToObj(value) },
        {},
      );

module.exports = function(content) {
  const config = maraca(content);
  return script(dataToObj(config));
};
