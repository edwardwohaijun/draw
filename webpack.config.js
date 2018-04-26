const path = require('path');
const webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

const config = {
  devtool: 'source-map',
  entry: {
    app: ['./browser/app.js'],
  },
  output: {
    path: path.resolve(__dirname, 'public/build'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /(node_modules|bower_components)/,
        loader: 'babel-loader',
        query: {
          presets: ['es2015', 'react', 'stage-2'],
          plugins: [
            "transform-es2015-block-scoping",
            "transform-class-properties",
            "transform-es2015-computed-properties"
          ]
        }
      },
      {
        test: /\.scss$/,
        include: /scss/,
        loaders: ['style-loader', 'css-loader', 'sass-loader'],
      },
      {
        test: /\.json$/,
        loader: "json-loader"
      },
      { test: /\.(jpe?g|gif|png|ico|svg)$/i, loader:'url-loader?limit=1024&name=images/[name].[ext]' },
      { test: /\.css$/, loader: ExtractTextPlugin.extract("css-loader"),},
      { test: /\.(woff|woff2|eot|ttf|svg)(\?.*$|$)/i, loader: 'url-loader?limit=10240&name=../fonts/[name].[ext]' }
    ]
  },

  plugins: [
    new ExtractTextPlugin('css/chainedStyle.css', {allChunks: true}),
    new webpack.DefinePlugin({
      'process.env':{
        'NODE_ENV': JSON.stringify('development'),
      }
    })
  ]
};
module.exports = config;
