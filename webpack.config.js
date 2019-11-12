const fs = require('fs');
const path = require('path');
const AddAssetPlugin = require('add-asset-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');
const HtmlTagsPlugin = require('html-webpack-tags-plugin');

const maraca = require('maraca').default;

const dataToObj = data =>
  data.type === 'value'
    ? data.value
    : data.value.reduce(
        (res, { key, value }) =>
          key.type === 'list' ? res : { ...res, [key.value]: dataToObj(value) },
        {},
      );

const config = dataToObj(maraca(fs.readFileSync('./app.ma', 'utf8')));
const port = Number(config.port) || 8080;

module.exports = env => ({
  mode: env === 'prod' ? 'production' : 'development',
  stats: 'errors-only',
  entry: './app.ma',
  output: {
    filename: 'main.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, '../../public'),
    publicPath: '/',
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './public',
    historyApiFallback: true,
    port,
  },
  resolve: {
    extensions: ['.ts', '.js'],
  },
  module: {
    rules: [
      {
        test: /\/app.ma$/,
        use: ['maraca-app'],
      },
      {
        test: /\.ma$/,
        exclude: /\/app.ma$/,
        use: ['maraca-loader'],
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader'],
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: ['file-loader'],
      },
      {
        test: /\.ts$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  plugins: [
    new AddAssetPlugin('_redirects', `/*    /index.html   200`),
    new AddAssetPlugin('style.css', css),
    new HTMLPlugin({
      title: '',
      favicon: typeof config.favicon === 'string' ? config.favicon : '',
    }),
    new HtmlTagsPlugin({ tags: ['/style.css'], usePublicPath: false }),
  ],
});

const css = `
html,
body,
div,
span,
applet,
object,
iframe,
h1,
h2,
h3,
h4,
h5,
h6,
p,
blockquote,
pre,
a,
abbr,
acronym,
address,
big,
cite,
code,
del,
dfn,
em,
img,
ins,
kbd,
q,
s,
samp,
small,
strike,
strong,
sub,
sup,
tt,
var,
b,
u,
i,
center,
dl,
dt,
dd,
ol,
ul,
li,
fieldset,
form,
label,
legend,
table,
caption,
tbody,
tfoot,
thead,
tr,
th,
td,
article,
aside,
canvas,
details,
embed,
figure,
figcaption,
footer,
header,
hgroup,
menu,
nav,
output,
ruby,
section,
summary,
time,
mark,
audio,
video {
  margin: 0;
  padding: 0;
  border: 0;
  font-size: 100%;
  font: inherit;
  vertical-align: baseline;
}
/* HTML5 display-role reset for older browsers */
article,
aside,
details,
figcaption,
figure,
footer,
header,
hgroup,
menu,
nav,
section {
  display: block;
}
body {
  line-height: 1;
}
ol,
ul {
  list-style: none;
}
blockquote,
q {
  quotes: none;
}
blockquote:before,
blockquote:after,
q:before,
q:after {
  content: '';
  content: none;
}
table {
  border-collapse: collapse;
  border-spacing: 0;
}

html {
  box-sizing: border-box;
}
*,
*:before,
*:after {
  box-sizing: inherit;
}

body {
  font-family: Arial, sans-serif;
  font-size: 20px;
  line-height: 1.5;
}

button,
input,
select,
textarea {
  display: block;
  width: 100%;
  font-family: inherit;
  font-size: inherit;
  line-height: inherit;
  font-weight: inherit;
  font-style: inherit;
  padding: 0;
  border: 0;
  background: transparent;
  outline: none;
}

html,
body,
#root {
  height: 100%;
}

img {
  display: block;
  width: 100%;
}

.CodeMirror {
  height: 100% !important;
}
`;
