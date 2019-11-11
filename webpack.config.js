const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AddAssetPlugin = require('add-asset-webpack-plugin');

module.exports = env => ({
  mode: env === 'prod' ? 'production' : 'development',
  stats: 'errors-only',
  entry: './config.ma',
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'public'),
  },
  devtool: 'inline-source-map',
  devServer: {
    contentBase: './public',
    historyApiFallback: true,
  },
  module: {
    rules: [
      {
        test: /\/config.ma$/,
        use: ['maraca-app'],
      },
      {
        test: /\.ma$/,
        exclude: /\/config.ma$/,
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
        use: [
          {
            loader: 'ts-loader',
            options: {
              compilerOptions: {
                target: 'es5',
                lib: ['dom', 'esnext'],
                module: 'esnext',
                moduleResolution: 'node',
                sourceMap: true,
                strict: true,
                noUnusedLocals: true,
                noUnusedParameters: true,
                noImplicitAny: false,
                downlevelIteration: true,
              },
            },
          },
        ],
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin(['favicon.ico'], { logLevel: 'error' }),
    new AddAssetPlugin('_redirects', `/*    /index.html   200`),
    new AddAssetPlugin('index.html', html),
  ],
});

const html = `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title></title>
    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
    <style>
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
    </style>
  </head>
  <body>
  <script type="text/javascript" src="main.js"></script></body>
</html>
`;
