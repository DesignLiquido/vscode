//@ts-check

'use strict';

const path = require('path');

/**@type {import('webpack').Configuration}*/
const webConfig = {
  target: 'webworker', // Web extensions run in webworker context
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
    mainFields: ['browser', 'module', 'main'], // Prefer browser-compatible versions
    extensions: ['.ts', '.js'],
    fallback: {
      // Exclude Node.js core modules - use vscode APIs instead
      'fs': false,
      'path': false,
      'os': false,
      'crypto': false,
      'stream': false,
      'util': false,
      'buffer': false,
      'process': false
    }
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'ts-loader',
            options: {
              transpileOnly: true, // Faster builds
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
    hints: false // Disable size warnings for now
  }
};

module.exports = webConfig;