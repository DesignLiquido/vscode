//@ts-check

'use strict';

const path = require('path');
const webpack = require('webpack');

/**@type {import('webpack').Configuration}*/
const webConfig = {
  target: 'webworker',
  entry: './fontes/extensao-web.ts',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'extensao-web.js',
    libraryTarget: 'commonjs2',
    devtoolModuleFilenameTemplate: '../[resource-path]'
  },
  devtool: 'source-map',
  externals: {
    vscode: 'commonjs vscode'
  },
  resolve: {
    mainFields: ['browser', 'module', 'main'],
    extensions: ['.ts', '.js'],
    fallback: {
      // Polyfills needed for antlr4ts
      'assert': require.resolve('assert/'),
      
      // Polyfills needed for @vscode/debugadapter
      'url': require.resolve('url/'),
      
      // Polyfills for other dependencies
      'timers': require.resolve('timers-browserify'),
      'tty': false, // Not needed in browser
      
      // Node.js core modules - exclude these
      'fs': false,
      'path': false,
      'os': false,
      'crypto': false,
      'stream': false,
      'util': false,
      'buffer': false,
      'process': false,
      'net': false,
      'readline': false,
      'child_process': false
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true,
              compilerOptions: {
                module: 'esnext'
              }
            }
          }
        ]
      }
    ]
  },
  performance: {
    hints: false
  },
  ignoreWarnings: [
    {
      module: /delegua-node/,
      message: /Critical dependency/
    },
    {
      module: /delprops[\\/]descobridor/,
      message: /Critical dependency/
    },
    {
      module: /delprops[\\/]sistema-arquivos-node/,
      message: /Critical dependency/
    }
  ]
};

module.exports = webConfig;