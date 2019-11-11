const path = require('path');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const AddAssetPlugin = require('add-asset-webpack-plugin');

module.exports = env => ({
  mode: env === 'prod' ? 'production' : 'development',
  stats: 'errors-only',
  entry: './src/config.ma',
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
        use: [{ loader: path.resolve('./src/loader.js') }],
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
    new AddAssetPlugin(
      'index.html',
      `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title></title>
    <link rel="shortcut icon" type="image/x-icon" href="/favicon.ico" />
  </head>
  <body>
  <script type="text/javascript" src="main.js"></script></body>
</html>
    `,
    ),
  ],
});
