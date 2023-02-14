import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';

const plugins = [
  babel({ babelHelpers: 'bundled' }),
  terser({ format: { ascii_only: true } }),
];

const target = (path) => ({
  input: `src/${path}.mjs`,
  output: [{ file: `build/${path}.js`, format: 'cjs' }],
  plugins,
});

export default [
  target('index'),
  target('extras/svg'),
  target('extras/jis'),
  {
    input: 'web/index.mjs',
    output: [{ file: 'web/build/index.min.mjs', format: 'esm' }],
    plugins,
  },
];
