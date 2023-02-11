import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';

const target = (path) => ({
  input: `src/${path}.mjs`,
  output: [{ file: `build/${path}.js`, format: 'cjs' }],
  plugins: [
    babel({ babelHelpers: 'bundled' }),
    terser({ format: { ascii_only: true } }),
  ],
});

export default [target('index'), target('extras/svg')];
