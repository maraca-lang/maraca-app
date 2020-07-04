const { default: maraca, fromJs, resolve, toJs } = require('maraca');
const { renderToString } = require('maraca-render');
const fs = require('fs-extra');

const config = toJs(maraca(fs.readFileSync('./app.ma', 'utf8')), {
  app: 'string',
  library: ['string', { '**': ['string', { '': 'string', '**': true }] }],
  pages: [['string']],
});

const getKey = (isDir, name) => {
  if (isDir) return name;
  const file = name.slice(0, -3);
  return file.toLowerCase() === 'start' ? '' : file;
};
const readDir = (dir) =>
  fs.readdirSync(dir).reduce((res, x) => {
    const path = `${dir}/${x}`;
    const isDir = fs.statSync(path).isDirectory();
    if (!isDir && !x.endsWith('.ma')) return res;
    return {
      ...res,
      [getKey(isDir, x)]: isDir ? readDir(path) : fs.readFileSync(path, 'utf8'),
    };
  }, {});
const modules = readDir(`./${config.app || 'app'}`);

const wrapModules = (library) =>
  Object.keys(library).reduce(
    (res, k) => ({
      ...res,
      [k]:
        typeof library[k] === 'function'
          ? library[k]
          : (set) => set(library[k]),
    }),
    {},
  );

(config.pages || [[]]).forEach((url) => {
  let title;
  const content = renderToString(
    maraca({
      ...modules,
      ...wrapModules({
        title: fromJs((value) => (_, get) => () => {
          const v = toJs(resolve(value, get), 'string');
          if (v) title = v;
        }),
        url: fromJs(url),
        ...(config.library
          ? typeof config.library === 'string'
            ? require(`../../${config.library}`).default
            : Object.keys(config.library).reduce((res, k) => {
                const n = parseFloat(k);
                if (!isNaN(k) && !isNaN(n) && n === Math.floor(n) && n > 0) {
                  if (typeof config.library[k] !== 'string') return res;
                  return {
                    ...res,
                    ...require(`../../${config.library[k]}`).default,
                  };
                }
                if (typeof config.library[k] === 'string') {
                  return {
                    ...res,
                    [k]: require(`../../${config.library[k]}`).default,
                  };
                }
                return res;
              }, {})
          : {}),
      }),
    }),
  );
  fs.ensureDirSync(`./public/${url.slice(0, -1).join('/')}`);
  fs.writeFileSync(
    `./public/${url.join('/') || 'index'}.html`,
    `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${title || ''}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link href="/style.css" rel="stylesheet">
        </head>
        <body>
          <div id="root">${content}</div>
          <script src="/main.js"></script>
        </body>
      </html>
    `,
  );
});
