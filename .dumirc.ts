import { defineConfig } from 'dumi';

export default defineConfig({
  base: '/x-star-editor/',
  publicPath: '/x-star-editor/',
  extraBabelPlugins: [
    ['babel-plugin-inline-import', { extensions: ['.worker.js'] }],
  ],
  apiParser: {},
  resolve: {
    entryFile: './src/index.ts',
  },
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'x-star-editor',
  },
});
