import { defineConfig } from 'dumi';

export default defineConfig({
  outputPath: 'docs-dist',
  themeConfig: {
    name: 'x-star-editor',
  },
  apiParser: {},
  resolve: {
    entryFile: './src/index.ts',
  },
});
