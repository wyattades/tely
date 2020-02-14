const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
// const { TsconfigPathsPlugin } = require('tsconfig-paths-webpack-plugin');

const tsConfigFile = path.join(__dirname, 'tsconfig.json');

const mode = process.env.NODE_ENV || 'production';

/**
 * @type {import("webpack").Configuration}
 */
module.exports = {
  entry: './main',
  mode,
  target: 'node',
  externals: [nodeExternals()],
  devtool: 'source-map',
  output: {
    libraryTarget: 'umd',
    filename: 'index.js',
    path: __dirname,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: mode,
    }),
  ],
  resolve: {
    extensions: ['.ts', '.js', '.tsx', '.jsx'],
    // plugins: [new TsconfigPathsPlugin({ configFile: tsConfigFile })],
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        loader: 'ts-loader',
        options: {
          configFile: tsConfigFile,
        },
        exclude: /node_modules/,
      },
      // {
      //   test: /\.jsx?$/,
      //   loader: 'babel-loader',
      //   exclude: /node_modules/,
      // },
    ],
  },
};
