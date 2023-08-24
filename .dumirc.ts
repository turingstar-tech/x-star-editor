import { defineConfig } from 'dumi';

export default defineConfig({
  base: '/x-star-editor/',
  publicPath: '/x-star-editor/',
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'x-star-editor',
  },
  apiParser: {},
  resolve: {
    entryFile: './src/index.ts',
  },
});
