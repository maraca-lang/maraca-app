const maraca = require('maraca').default;

const toIndex = v => {
  const n = parseFloat(v);
  return !isNaN(v) && !isNaN(n) && n === Math.floor(n) && n > 0 && n;
};

const getFontsConfig = fonts => {
  if (typeof fonts === 'string') return [fonts];
  return Object.keys(fonts)
    .filter(toIndex)
    .map(k => fonts[k]);
};

const script = config => `

const { default: maraca, fromJs, toJs } = require('maraca');
const { default: render } = require('maraca-render');
const { createBrowserHistory, createMemoryHistory } = require('history');

${
  config.fonts
    ? `
if (typeof window !== 'undefined') {
  const webfont = require('webfontloader');
  webfont.load({
    google: { families: ${JSON.stringify(getFontsConfig(config.fonts))} },
  });
}
      `
    : ``
}

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

const websocketStream = url => emit => {
  const ws = new WebSocket(url);
  let isOpen = false;
  const messages = [];
  ws.addEventListener('open', () => {
    isOpen = true;
    while (messages.length) ws.send(messages.shift());
  });
  const set = data => {
    const message = JSON.stringify(toJs(data) || '');
    if (isOpen) ws.send(message);
    else messages.push(message);
  };
  emit({ ...fromJs(null), set });
  ws.addEventListener('message', m => {
    emit({ ...fromJs(JSON.parse(m.data)), set });
  });
  return () => ws.close();
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
      ...fromJs(
        location.pathname
          .slice(1)
          .split('/')
          .map((s, i) => ({ key: i + 1, value: s })),
      ),
      set: v => run(v),
    });
    emit(toValue(history.location));
    return history.listen(location => emit(toValue(location)));
  },
  ${Object.keys((typeof config.library === 'object' && config.library) || {})
    .map(k => {
      const n = parseFloat(k);
      if (!isNaN(k) && !isNaN(n) && n === Math.floor(n) && n > 0) {
        if (typeof config.library[k] !== 'string') return null;
        return `...(require('./${config.library[k]}').default),`;
      }
      if (typeof config.library[k] === 'string') {
        return `'${k}': require('./${config.library[k]}').default,`;
      }
      if (config.library[k][''] === 'websocket') {
        return `'${k}': websocketStream('${config.library[k].url}'),`;
      }
      return null;
    })
    .filter(s => s)
    .join('\n')}
};

const dynamics = ${
  typeof config.dynamics === 'string'
    ? `require('./${config.dynamics}').default`
    : '[]'
}

const config = { '@': dynamics, '#': library };

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
