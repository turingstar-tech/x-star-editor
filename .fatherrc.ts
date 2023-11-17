import { defineConfig } from 'father';

export default defineConfig({
  // more father config: https://github.com/umijs/father/blob/master/docs/config.md
  esm: {
    extraBabelPlugins: [
      ['babel-plugin-inline-import', { extensions: ['.worker.js'] }],
    ],
    output: 'dist',
    ignores: ['src/**/*.{scss,worker.ts}'],
  },
});
