import { defineConfig } from 'father';

export default defineConfig({
  // more father config: https://github.com/umijs/father/blob/master/docs/config.md
  esm: { output: 'dist', ignores: ['{src,test}/**/*.{scss,worker.ts}'] },
  umd: {
    entry: 'src/utils/markdown.worker',
    output: { path: 'workers', filename: 'markdown.worker.js' },
  },
});
