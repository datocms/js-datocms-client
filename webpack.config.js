var webpack = require('webpack');
var path = require('path');
var Visualizer = require('webpack-visualizer-plugin');

var BUILD_DIR = path.resolve(__dirname, 'dist');
var APP_DIR = path.resolve(__dirname, 'src');

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
      }
    ]
  },
  output: {
    path: BUILD_DIR,
    filename: 'datocms.js',
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
    }
  }),
  new webpack.optimize.UglifyJsPlugin({
    compress: { warnings: false },
    comments: false,
  }),
  new Visualizer(),
];

module.exports = config;
