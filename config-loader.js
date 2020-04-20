const { default: maraca, toJs } = require('maraca');

const script = (config) => `

const path = require('path');
const { default: maraca, fromJs, print, toJs } = require('maraca');
const { default: render } = require('maraca-render');
const { createBrowserHistory, createMemoryHistory } = require('history');


${
  config.fonts
    ? `
if (typeof window !== 'undefined') {
  const webfont = require('webfontloader');
  webfont.load({ google: { families: ${JSON.stringify(config.fonts)} } });
}
      `
    : ''
}

const set = (obj, path, value) =>
  path.reduce(
    (res, k, i) => (res[k] = i === path.length - 1 ? value : res[k] || {}),
    obj,
  );
const app = require.context('./${config.app || 'app'}', true, /\.ma$/);
const modules = app.keys().reduce((res, k) => {
  const p = k.slice(2, -3).split(path.sep);
  if (p[p.length - 1].toLowerCase() === 'start') p[p.length - 1] = '';
  set(res, p, app(k).default);
  return res;
}, {});

const history =
  typeof window === 'undefined'
    ? createMemoryHistory()
    : createBrowserHistory();

const getUrl = (value) => {
  const v = toJs(value, ['string', ['string']]);
  if (typeof v === 'string') return v;
  return v.join('/');
};

const websocketStream = (url) => (set, get) => {
  const ws = new WebSocket(url);
  let isOpen = false;
  const messages = [];
  ws.addEventListener('open', () => {
    isOpen = true;
    while (messages.length) ws.send(messages.shift());
  });
  const push = (data) => {
    const message = print(get(data, true));
    if (isOpen) ws.send(message);
    else messages.push(message);
  };
  set({ ...fromJs(null), push });
  ws.addEventListener('message', (m) => {
    set({ ...maraca(m.data), push });
  });
  return (dispose) => dispose && ws.close();
};

const library = {
  title: fromJs((value) => (_, get) => () => {
    const v = toJs(get(value), 'string');
    if (v) document.title = v;
  }),
  url: (set, get) => {
    const run = (v) => {
      const url = getUrl(v);
      if (url.startsWith('http')) {
        window.open(url, '_blank');
      } else {
        const newUrl = \`/\${url}\`;
        if (newUrl !== history.location.pathname) {
          history.push(\`/\${url}\`);
          window.scroll(0, 0);
        }
      }
    };
    const toValue = (location) => ({
      ...fromJs(
        location.pathname
          .slice(1)
          .split('/')
          .map((s, i) => ({ key: i + 1, value: s })),
      ),
      push: (v) => run(get(v, true)),
    });
    set(toValue(history.location));
    const unlisten = history.listen((location) => set(toValue(location)));
    return (dispose) => dispose && unlisten();
  },
  ${
    config.library
      ? typeof config.library === 'string'
        ? `...(require('./${config.library}').default)`
        : Object.keys(config.library)
            .map((k) => {
              const n = parseFloat(k);
              if (!isNaN(k) && !isNaN(n) && n === Math.floor(n) && n > 0) {
                if (typeof config.library[k] !== 'string') return null;
                return `...(require('./${config.library[k]}').default),`;
              }
              if (typeof config.library[k] === 'string') {
                return `'${k}': require('./${config.library[k]}').default,`;
              }
              if (config.library[k][''] === 'websocket') {
                const url = toJs(config.library[k].url, 'string');
                return url && `'${k}': websocketStream('${url}'),`;
              }
              return null;
            })
            .filter((s) => s)
            .join('\n')
      : ''
  }
};
const wrappedLibrary = Object.keys(library).reduce(
  (res, k) => ({
    ...res,
    [k]:
      typeof library[k] === 'function' ? library[k] : (set) => set(library[k]),
  }),
  {},
);

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

maraca({ ...modules, ...wrappedLibrary }, render(root));

`;

module.exports = function (config) {
  return script(
    toJs(maraca(config), {
      app: 'string',
      library: ['string', { '**': ['string', { '': 'string', '**': true }] }],
      fonts: ['string'],
    }),
  );
};
