const path = require('path');
const fs = require('fs');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = env => ({
  mode: env === 'prod' ? 'production' : 'development',
  entry: './node_modules/maraca-app/lib/index',
  devtool: 'inline-source-map',
  module: {
    rules: [
      {
        test: /\.ma$/,
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
        test: /\.tsx?$/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              configFile: '../node_modules/maraca-app/tsconfig.app.json',
            },
          },
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.ma', '.js', '.ts'],
  },
  output: {
    filename: '[name].bundle.js',
    chunkFilename: '[name].bundle.js',
    path: path.resolve(__dirname, '../../public'),
    publicPath: '/',
  },
  devServer: {
    historyApiFallback: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      FILES: JSON.stringify(
        fs
          .readdirSync('./app')
          .filter(f => f.endsWith('.ma'))
          .map(f => f.slice(0, -3)),
      ),
    }),
    new HtmlWebpackPlugin({
      title: '',
      template: 'node_modules/maraca-app/index.html',
    }),
    new CopyWebpackPlugin([
      'favicon.ico',
      'node_modules/maraca-app/_redirects',
    ]),
  ],
});
