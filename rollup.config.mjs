import terser from '@rollup/plugin-terser';
import { babel } from '@rollup/plugin-babel';

const plugins = [
  babel({ babelHelpers: 'bundled' }),
  terser({
    format: { ascii_only: true },
    mangle: { properties: { regex: /^_/ } },
  }),
];

const target = (path) => ({
  input: `src/${path}.mjs`,
  output: [{ file: `build/${path}.js`, format: 'cjs' }],
  plugins,
});

export default [
  target('index'),
  target('extras/svg'),
  target('extras/react'),
  {
    input: 'bin/cli.mjs',
    output: {
      banner: '#!/usr/bin/env node\n',
      file: 'build/cli.mjs',
      format: 'esm',
    },
    external: [/\/build\//],
    plugins,
  },
  {
    input: 'web/index.mjs',
    output: { file: 'web/build/index.min.mjs', format: 'esm' },
    plugins,
  },
];
