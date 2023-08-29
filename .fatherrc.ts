import { defineConfig } from 'father';

export default defineConfig({
  // more father config: https://github.com/umijs/father/blob/master/docs/config.md
  esm: { output: 'dist', ignores: ['src/**/*.scss'] },
  umd: {
    entry: 'src/utils/markdown.worker',
    output: { path: 'src/workers', filename: 'markdown.worker.js' },
  },
});
