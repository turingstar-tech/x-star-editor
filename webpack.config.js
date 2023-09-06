const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = [
  {
    entry: './src/utils/markdown.worker.ts',
    mode: 'production',
    output: {
      filename: 'markdown.worker.js',
      path: path.resolve(__dirname, 'workers-dist'),
    },
    module: {
      rules: [{ test: /\.ts$/, use: 'babel-loader', exclude: /node_modules/ }],
    },
    resolve: { extensions: ['.ts', '...'] },
    optimization: {
      minimize: true,
      minimizer: [new TerserPlugin({ extractComments: false })],
    },
  },
];
