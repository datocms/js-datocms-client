const webpack = require('webpack');
const path = require('path');
const Visualizer = require('webpack-visualizer-plugin');

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'src');
const addPolyfills = !!process.env.ADD_POLYFILLS;

var config = {
  entry: APP_DIR + '/index.js',
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        include: APP_DIR,
        loaders: ['eslint']
      }
    ],
    loaders: [
      {
        test: /\.js?$/,
        include: APP_DIR,
        loaders: ['babel']
      },
      {
        test: /\.json$/,
        loader: 'json'
      },
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: `client${addPolyfills ? '.shims' : ''}.js`,
    library: 'Dato',
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  devtool: 'source-map'
};

config.plugins = [
  new webpack.IgnorePlugin(/(adapters\/node|node-fetch)/),
  new webpack.DefinePlugin({
    'process.env': {
      'NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      'APP_ENV': JSON.stringify('browser'),
      'ADD_POLYFILLS': JSON.stringify(addPolyfills),
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
    comments: false,
  })
];

module.exports = config;
