const webpack = require('webpack');
const path = require('path');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin;

const BUILD_DIR = path.resolve(__dirname, 'dist');
const APP_DIR = path.resolve(__dirname, 'src');

const config = {
  entry: `${APP_DIR}/browser.js`,
  mode: 'production',
  module: {
    rules: [
      {
        test: /\.js$/,
        include: APP_DIR,
        loader: 'eslint-loader',
        enforce: 'pre',
      },
      {
        test: /\.js?$/,
        include: APP_DIR,
        loader: 'babel-loader',
      },
    ],
  },
  output: {
    path: BUILD_DIR,
    filename: 'client.js',
    library: 'Dato',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  devtool: 'source-map',
  optimization: { minimize: true },
  resolve: {
    alias: {
      'js-yaml$': path.resolve(__dirname, 'src/utils/nop.js'),
      http$: path.resolve(__dirname, 'src/utils/nop.js'),
      'https-proxy-agent$': path.resolve(__dirname, 'src/utils/nop.js'),
      './adapters/node': path.resolve(
        __dirname,
        'src/upload/adapters/browser.js',
      ),
    },
  },
};

config.plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),
  // new BundleAnalyzerPlugin(),
].filter(x => !!x);

module.exports = config;
