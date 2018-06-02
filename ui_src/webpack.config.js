const webpack = require('webpack');
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;

const htmlPlugin = new HtmlWebpackPlugin({
  template: "./src/index.html",
  filename: "./index.html"
});

const isDevelopment = (process.env.WEBPACK_MODE === 'development');

module.exports = (env, options) => {
  let webpackConfig = {
    entry: {
      index: './src/index.js',
    },
    output: {
      filename: '[name].js',
      chunkFilename: "[name].js",
    },
    module: {
      rules: [
        {
          test: /\.jsx?$/,
          exclude: /node_modules/,
          use: {
            loader: "babel-loader"
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        },
        {
          test: /\.scss/,
          use: [
            {
              loader: 'style-loader',
            },
            {
              loader: 'css-loader',
              options: {
                modules: true,
                importLoaders: 1,
                localIdentName: "[name]_[local]_[hash:base64]",
                sourceMap: isDevelopment,
                minimize: true
              }
            },
            {
              loader: 'sass-loader',
              options: {
                sourceMap: isDevelopment,
              }
            },
          ],
        },
        {
          // 対象となるファイルの拡張子
          test: /\.(gif|png|jpg|eot|wof|woff|woff2|ttf|svg)$/,
          // 画像をBase64として取り込む
          loader: 'url-loader'
        }
      ]
    },
    plugins: [
      // new BundleAnalyzerPlugin(),
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      htmlPlugin
    ],
    optimization: {
      runtimeChunk: {
          name: "manifest"
      },
      splitChunks: {
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendor",
            priority: -20,
            chunks: "all",
            enforce: true
          }
        }
      }
    }
  }

  if (options.mode === 'development') {
    webpackConfig.devServer = {
      proxy: {
        '/api': {
          target: 'http://localhost:8000'
        }
      }
    }
  }

  return webpackConfig;
}
