const autoprefixer = require('autoprefixer')
const webpack = require('webpack')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const ManifestPlugin = require('webpack-manifest-plugin')
const InterpolateHtmlPlugin = require('react-dev-utils/InterpolateHtmlPlugin')
const path = require('path')
const paths = require('./paths')
const getClientEnvironment = require('./env')

const publicPath = paths.servedPath
const shouldUseRelativeAssetPaths = publicPath === './'
const publicUrl = publicPath.slice(0, -1)
const env = getClientEnvironment(publicUrl)

const cssFilename = 'static/css/[name].[contenthash:8].css'

const extractTextPluginOptions = shouldUseRelativeAssetPaths
  ? { publicPath: Array(cssFilename.split('/').length).join('../') }
  : undefined

const commonLoaders = [
  {
    exclude: [
      /\.html$/,
      /\.(js|jsx)$/,
      /\.css$/,
      /\.json$/,
      /\.svg$/,
    ],
    loader: 'url',
    query: {
      limit: 10000,
      name: 'static/media/[name].[hash:8].[ext]',
    },
  },
  {
    test: /\.json$/,
    loader: 'json',
  },
  {
    test: /\.svg$/,
    loader: 'file',
    query: {
      name: 'static/media/[name].[hash:8].[ext]',
    },
  },
  {
    test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url',
    query: { limit: 10000, mimetype: 'application/font-woff', name: 'static/fonts/[name]/[name].[ext]' },
  },
  {
    test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url',
    query: { limit: 10000, mimetype: 'application/font-woff', name: 'static/fonts/[name]/[name].[ext]' },
  },
  {
    test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'url',
    query: { limit: 10000, mimetype: 'application/octet-stream', name: 'static/fonts/[name]/[name].[ext]' },
  },
  {
    test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
    loader: 'file',
    query: { name: 'static/fonts/[name]/[name].[ext]' },
  },
]
const commonPlugins = [
  new InterpolateHtmlPlugin(env.raw),
  new webpack.DefinePlugin(env.stringified),
  new webpack.optimize.OccurrenceOrderPlugin(),
  new webpack.optimize.DedupePlugin(),
  new webpack.optimize.UglifyJsPlugin({
    compress: {
      screw_ie8: true,
      warnings: false,
    },
    mangle: {
      screw_ie8: true,
    },
    output: {
      comments: false,
      screw_ie8: true,
    },
  }),
  new ExtractTextPlugin(cssFilename),
]

const commonAlias = {
  'react-native': 'react-native-web',
  '~components': path.resolve(__dirname, '../src/components'),
  '~ressources': path.resolve(__dirname, '../src/ressources'),
  '~src': path.resolve(__dirname, '../src'),
  '~containers': path.resolve(__dirname, '../src/containers'),
  '@theme': path.resolve(__dirname, '../src/ressources/theme'),
}

module.exports = [{
  /*
  *
  * //////////////
  * BROWSER BUNDLE
  * //////////////
  *
  */
  name: 'browser bundle',
  bail: true,
  devtool: 'source-map',
  entry: [
    require.resolve('./polyfills'),
    paths.appIndexJs,
  ],
  output: {
    path: paths.appBuild,
    filename: 'static/js/[name].[chunkhash:8].js',
    chunkFilename: 'static/js/[name].[chunkhash:8].chunk.js',
    publicPath,
  },
  resolve: {
    fallback: paths.nodePaths,
    extensions: ['.js', '.json', '.jsx', ''],
    alias: commonAlias,
  },
  progress: true,
  module: {
    loaders: [
      commonLoaders.concat([
        {
          test: /\.css$/,
          include: paths.appSrc,
          loader: ExtractTextPlugin.extract(
            'style',
            'css?importLoaders=1!postcss',
            extractTextPluginOptions // eslint-disable-line
          ),
        },
        {
          test: /\.(js|jsx)$/,
          include: paths.appSrc,
          loader: 'babel-loader',
        },
      ]),
    ],
  },
  postcss: () => {
    return [
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9',
        ],
      }),
    ]
  },
  plugins: commonPlugins.concat([
    new ManifestPlugin({
      fileName: 'asset-manifest.json',
    }),
  ]),
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
}, {
  /*
  *
  * /////////////
  * SERVER BUNDLE
  * /////////////
  *
  */
  name: 'server bundle',
  bail: true,
  entry: [
    require.resolve('./polyfills'),
    paths.appServ,
  ],
  target: 'node',
  output: {
    libraryTarget: 'commonjs2',
    path: paths.appBuild,
    filename: 'core.js',
    publicPath,
  },
  externals: /^[a-z\-0-9]+$/,
  resolve: {
    fallback: paths.nodePaths,
    extensions: ['.js', '.json', '.jsx', ''],
    alias: commonAlias,
  },
  progress: true,
  module: {
    loaders: [
      commonLoaders.concat([
        {
          test: /\.css$/,
          include: [paths.servDir, paths.appSrc],
          loader: 'css-loader',
        }, // eslint-disable-line
        {
          test: /\.(js|jsx)$/,
          include: [paths.servDir, paths.appSrc],
          loader: 'babel-loader',
        },
      ]),
    ],
  },
  postcss: () => {
    return [
      autoprefixer({
        browsers: [
          '>1%',
          'last 4 versions',
          'Firefox ESR',
          'not ie < 9',
        ],
      }),
    ]
  },
  plugins: commonPlugins,
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
}]
