'use strict'
const IsWeb = process.env.BUILD_TARGET === 'web'
process.env.BABEL_ENV = IsWeb ? 'web' : 'renderer'
IsWeb ? process.browser = true : process.browser = false

const path = require('path')
const { dependencies } = require('../package.json')
const webpack = require('webpack')
const config = require('../config')
const { styleLoaders } = require('./utils')

const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const { ESBuildMinifyPlugin } = require('esbuild-loader')
const { VueLoaderPlugin } = require('vue-loader')

function resolve(dir) {
  return path.join(__dirname, '..', dir)
}
/**
 * List of node_modules to include in webpack bundle
 *
 * Required for specific packages like Vue UI libraries
 * that provide pure *.vue files that need compiling
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/webpack-configurations.html#white-listing-externals
 */
let whiteListedModules = IsWeb ? [] : ['vue', "element-ui"]

let rendererConfig = {
  devtool: '#cheap-module-eval-source-map',
  entry: IsWeb ? { web: path.join(__dirname, '../src/renderer/main.js') } : { renderer: resolve('src/renderer/main.js') },
  externals: IsWeb ? [] : [...Object.keys(dependencies || {}).filter(d => !whiteListedModules.includes(d))],
  module: {
    rules: [
      {
        test: /\.html$/,
        use: 'vue-html-loader'
      },
      {
        test: /\.js$/,
        loader: 'esbuild-loader',
      },
      {
        test: /\.node$/,
        use: 'node-loader'
      },
      {
        test: /\.vue$/,
        use: {
          loader: 'vue-loader',
          options: {
            cacheDirectory: 'node_modules/.cache/vue-loader',
            cacheIdentifier: '7270960a',
          }
        }
      },
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [resolve('src/renderer/icons')],
        options: {
          symbolId: 'icon-[name]'
        }
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        exclude: [resolve('src/renderer/icons')],
        use: {
          loader: 'url-loader',
          query: {
            esModule: false,
            limit: 10000,
            name: 'imgs/[name]--[folder].[ext]'
          }
        },
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          esModule: false,
          limit: 10000,
          name: 'media/[name]--[folder].[ext]'
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        use: {
          loader: 'url-loader',
          query: {
            esModule: false,
            limit: 10000,
            name: 'fonts/[name]--[folder].[ext]'
          }
        }
      }
    ]
  },
  node: {
    __dirname: process.env.NODE_ENV !== 'production',
    __filename: process.env.NODE_ENV !== 'production'
  },
  plugins: [
    new VueLoaderPlugin(),
    new MiniCssExtractPlugin(),
    new webpack.DefinePlugin({
      'process.env': process.env.NODE_ENV === 'production' ? config.build.env : config.dev.env,
      'process.env.IS_WEB': IsWeb
    }),
    new HtmlWebpackPlugin({
      filename: 'index.html',
      template: resolve('src/index.ejs'),
      minify: {
        collapseWhitespace: true,
        removeAttributeQuotes: true,
        removeComments: true,
        minifyJS: true,
        minifyCSS: true
      },
      templateParameters(compilation, assets, options) {
        return {
          compilation: compilation,
          webpack: compilation.getStats().toJson(),
          webpackConfig: compilation.options,
          htmlWebpackPlugin: {
            files: assets,
            options: options
          },
          process,
        };
      },
      nodeModules: false
    }),
    new webpack.HotModuleReplacementPlugin(),
  ],
  output: {
    filename: '[name].js',
    libraryTarget: IsWeb ? 'var' : 'commonjs2',
    path: IsWeb ? path.join(__dirname, '../dist/web') : path.join(__dirname, '../dist/electron')
  },
  resolve: {
    alias: {
      '@': resolve('src/renderer'),
      'vue$': 'vue/dist/vue.esm.js'
    },
    extensions: ['.js', '.vue', '.json', '.css', '.node']
  },
  target: IsWeb ? 'web' : 'electron-renderer'
}
// 将css相关得loader抽取出来
rendererConfig.module.rules = rendererConfig.module.rules.concat(styleLoaders({ sourceMap: process.env.NODE_ENV !== 'production' ? config.dev.cssSourceMap : false, extract: IsWeb, minifyCss: process.env.NODE_ENV === 'production' }))

/**
 * Adjust rendererConfig for development settings
 */
if (process.env.NODE_ENV !== 'production' && !IsWeb) {
  rendererConfig.plugins.push(
    new webpack.DefinePlugin({
      '__lib': `"${path.join(__dirname, `../${config.DllFolder}`).replace(/\\/g, '\\\\')}"`
    })
  )
}

/**
 * Adjust rendererConfig for production settings
 */
if (process.env.NODE_ENV === 'production') {
  rendererConfig.devtool = ''

  rendererConfig.plugins.push(
    IsWeb ?
      new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, '../static'),
            to: path.join(__dirname, '../dist/web/static'),
            globOptions: {
              ignore: ['.*']
            }
          }
        ]
      }) : new CopyWebpackPlugin({
        patterns: [
          {
            from: path.join(__dirname, '../static'),
            to: path.join(__dirname, '../dist/electron/static'),
            globOptions: {
              ignore: ['.*']
            }
          }
        ]
      }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': '"production"',
      'process.env.libPath': `"${config.DllFolder}"`
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    })
  )
  rendererConfig.optimization = {
    minimizer: [
      new ESBuildMinifyPlugin({
        sourcemap: false,
        minifyWhitespace: true,
        minifyIdentifiers: true,
        minifySyntax: true,
        css: true
      })
    ]
  }
  rendererConfig.optimization.splitChunks = {
    chunks: "async",
    cacheGroups: {
      vendor: { // 将第三方模块提取出来
        minSize: 30000,
        minChunks: 1,
        test: /node_modules/,
        chunks: 'initial',
        name: 'vendor',
        priority: 1
      },
      commons: {
        test: /[\\/]src[\\/]common[\\/]/,
        name: 'commons',
        minSize: 30000,
        minChunks: 3,
        chunks: 'initial',
        priority: -1,
        reuseExistingChunk: true // 这个配置允许我们使用已经存在的代码块
      }
    }
  }
  rendererConfig.optimization.runtimeChunk = { name: 'runtime' }
}

module.exports = rendererConfig
