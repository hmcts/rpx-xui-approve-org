/* eslint-disable */
const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const TerserPlugin = require('terser-webpack-plugin');

const {
  NODE_ENV = 'production'
} = process.env;

module.exports = {
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          sourceMap: true
        }
      })
    ]
  },
  entry: './server.ts',
  mode: NODE_ENV,
  target: 'node',
  devtool: 'source-map',
  node: {
    __dirname: false,
    __filename: false
  },
  plugins: [
    new webpack.DefinePlugin({ 'global.GENTLY': false })
  ],
  output: {
    path: path.resolve(__dirname, '../dist/organisation-manager/api'),
    filename: 'server.bundle.js'
  },
  resolve: {
    extensions: ['.ts', '.js'],
    fallback: {
      "@azure/functions-core": false
    }
  },
  externals: [
    nodeExternals({
      // Yarn hoists API dependencies to the repository root. Keep the telemetry
      // SDK outside the bundle so Node resolves its nested dependency versions.
      modulesDir: path.resolve(__dirname, '../node_modules'),
      whitelist: ['otp']
    }),
    {
      '@azure/functions-core': 'commonjs @azure/functions-core'
    }
  ],
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: [
          'ts-loader'
        ],
        exclude: /node_modules/
      }
    ]
  }
};
