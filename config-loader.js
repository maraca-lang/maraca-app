const maraca = require('maraca').default;

const script = config => `

const { default: maraca, fromJs } = require('maraca');
const { default: render } = require('maraca-render');
const { createBrowserHistory, createMemoryHistory } = require('history');

const app = require.context('./${
  typeof config.app === 'string' ? config.app : 'app'
}', true, /\.ma$/);
const { start, ...modules } = app
  .keys()
  .reduce((res, k) => ({ ...res, [k.slice(2, -3)]: app(k).default }), {});

const history =
  typeof window === 'undefined'
    ? createMemoryHistory()
    : createBrowserHistory();

const getUrl = value => {
  if (value.type !== 'list') return value.value || '';
  return value.value
    .map(v => (v.value.type === 'value' ? v.value.value : ''))
    .join('/');
};

const library = {
  title: fromJs(() => value => {
    if (value && value.type === 'value') document.title = value.value;
  }),
  url: emit => {
    const run = v => {
      const url = getUrl(v);
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        history.push(\`/\${url}\`);
        window.scroll(0, 0);
      }
    };
    const toValue = location => ({
      ...fromJs(location.pathname.slice(1).split('/')),
      set: v => run(v),
    });
    emit(toValue(history.location));
    return history.listen(location => emit(toValue(location)));
  },
};

const streams = ${
  typeof config.streams === 'string'
    ? `require('./${config.streams}').default`
    : '{}'
};

const config = {
  '@': streams['@'] || [],
  '#': { ...library, ...(streams['#'] || {}) },
};

const components = ${
  typeof config.components === 'string'
    ? `require('./${config.components}').default`
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
