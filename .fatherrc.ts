import { defineConfig } from 'father';

export default defineConfig({
  // more father config: https://github.com/umijs/father/blob/master/docs/config.md
  extraBabelPlugins: [
    ['babel-plugin-inline-import', { extensions: ['.worker.js'] }],
  ],
  esm: { output: 'dist', ignores: ['{src,test}/**/*.{scss,worker.ts}'] },
  umd: {
    entry: 'src/utils/markdown.worker',
    output: { path: 'workers-dist', filename: 'markdown.worker.js' },
  },
});
