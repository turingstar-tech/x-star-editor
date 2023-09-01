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
    footer:
      '<div class="dumi-default-footer">版权所有©杭州信友队教育科技有限公司 | Powered by <a href="https://d.umijs.org" target="_blank" rel="noreferrer">dumi</a></div>',
    socialLinks: {
      github: 'https://github.com/turingstar-tech/x-star-editor',
    },
  },
});
