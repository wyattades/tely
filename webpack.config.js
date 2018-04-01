const webpack = require('webpack');
const res = require('path').resolve;
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const autoprefixer = require('autoprefixer');

const PATHS = {};
PATHS.dist = res(__dirname, 'dist');
PATHS.src = res(__dirname, 'src');
PATHS.template = res(PATHS.src, 'boilerplate.pug');
PATHS.assetName = 'asset/[name].[ext]';
PATHS.entry = './src/index.js';

const loaderHTML = `<div class="spinner">
<div class="bounce1"></div>
<div class="bounce2"></div>
<div class="bounce3"></div>
</div>`;
  
const baseConfig = {

  mode: process.env.NODE_ENV,

  context: __dirname,
  
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [{
          loader: 'babel-loader',
        }],
        include: PATHS.src,
      }, {
        test: /\.pug$/,
        loader: 'pug-loader',
        include: PATHS.src,
        options: {}, // Must provide options b/c pug-loader is broken!
      }, {
        test: /\.s?css$/,
        loaders: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              options: {
                autoprefixer: false,
                importLoaders: 1,
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: () => [ autoprefixer() ],
              },
            },
            'sass-loader',
          ],
        }),
        include: PATHS.css,
      }, {
        test: /\.(gif|jpe?g|png|svg)(\?\w+=[\d.]+)?$/,
        use: [ {
          loader: 'url-loader',
          options: {
            limit: 10000,
            name: PATHS.assetName,
          },
        } ],
        // include: PATHS.images,
      }, {
        test: /\.(ttf|eot|woff|woff2)(\?\w+=[\d.]+)?$/,
        loader: 'url-loader',
        options: {
          name: PATHS.assetName,
          limit: 10000,
        },
        // include: PATHS.fonts,
      },
    ],
  },
};

const sharedPlugins = [

  new webpack.DefinePlugin({
    'process.env': {
      NODE_ENV: JSON.stringify(process.env.NODE_ENV),
    },
  }),

  new ExtractTextPlugin({
    filename: '[name].[md5:contenthash:hex:20].css',
    allChunks: true,
    disable: process.env.NODE_ENV !== 'production',
  }),

  new HtmlWebpackPlugin({
    template: PATHS.template, // required
    inject: false, // required
    filename: 'index.html',
    title: 'Tely',
    meta: [{
      name: 'description',
      content: 'Mom! Come look at the Tely!',
    }],
    mobile: true,
    loader: loaderHTML,
    // cache: false,
    // favicon: res(PATHS.src, 'images/favicon.ico'),
    appMountId: 'react-root',

    ...(process.env.NODE_ENV === 'production' ? {
      minify: {
        collapseWhitespace: true,
        preserveLineBreaks: true,
        minifyJS: true,
      },
      // googleAnalytics: {
      //   trackingId: '<tracking_id>',
      //   pageViewOnLoad: true,
      // },
    } : {}),
  }),
  
];

if (process.env.NODE_ENV === 'production') { // PRODUCTION CONFIG

  module.exports = {
    
    entry: {
      main: PATHS.entry,
    },

    output: {
      path: PATHS.dist,
      publicPath: '/tely/', // use gh-pages directory as root
      filename: '[name].[chunkhash].js',
    },

    plugins: [

      new CleanWebpackPlugin([ 'dist' ]),

      ...sharedPlugins,
            
      new webpack.optimize.OccurrenceOrderPlugin(),

      new UglifyJsPlugin({
        parallel: true,
      }),

      // CommonsChunkPlugin: vendor must come before runtime
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'vendor',
      //   minChunks: ({ resource }) => /node_modules/.test(resource),
      // }),
      
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: 'runtime',
      // }),

      new OptimizeCssAssetsPlugin({
        cssProcessorOptions: { discardComments: { removeAll: true } },
      }),
      
    ],

    ...baseConfig,
  };

} else if (process.env.NODE_ENV === 'development') { // DEVELOPMENT CONFIG

  module.exports = {

    devtool: 'eval-source-map',

    output: {
      publicPath: '/',
    },

    devServer: {
      hot: true,
      historyApiFallback: true,
      port: 8080,
    },

    entry: [
      'webpack-dev-server/client?http://0.0.0.0:8080',
      'webpack/hot/only-dev-server',
      PATHS.entry,
    ],

    plugins: [

      ...sharedPlugins,

      new webpack.NamedModulesPlugin(),

      new webpack.HotModuleReplacementPlugin(),
    ],
    
    ...baseConfig,
  };

} else {
  throw new Error('Please set NODE_ENV environment variable to "production" or "development"');
}
