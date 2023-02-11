import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';

const plugins = [
  babel({ babelHelpers: 'bundled' }),
  terser({ format: { ascii_only: true } }),
];

export default [
  {
    input: 'src/index.mjs',
    output: {
      file: 'build/index.js',
      format: 'cjs',
    },
    plugins,
  },
  {
    input: 'src/extras/svg.mjs',
    output: {
      file: 'build/extras/svg.js',
      format: 'cjs',
    },
    plugins,
  },
];
