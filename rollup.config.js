import { terser } from 'rollup-plugin-terser';
import { babel } from '@rollup/plugin-babel';

const plugins = [
  babel({
    babelHelpers: 'bundled',
    presets: [
      [
        '@babel/preset-env',
        {
          useBuiltIns: false,
          targets: {
            node: '14',
            browsers: [
              'last 1 chrome version',
              'last 1 firefox version',
              'last 1 ios version',
              //'last 1 edge version',
              //'last 1 safari version',
            ],
          },
        },
      ],
    ],
  }),
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
