import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { strip } from './tools/rollup-plugin-strip.mjs';

const plugins = [
  nodeResolve(), // for tests
  terser({
    format: { ascii_only: true },
    mangle: { properties: { regex: /^_/ } },
  }),
];

const target = (path) => ({
  input: `src/${path}.mjs`,
  output: [
    { file: `build/${path}.mjs`, format: 'esm' },
    { file: `build/${path}.js`, format: 'cjs' },
  ],
  plugins,
});

export default [
  target('index'),
  target('extras/svg'),
  target('extras/node_export'),
  target('extras/react'),
  target('extras/errors'),
  {
    input: 'src/web-component/LeanQRElement.mjs',
    output: { file: 'build/webcomponent.mjs', format: 'esm' },
    plugins: [
      strip('exclude-webcomponent'),
      terser({
        format: { ascii_only: true },
        mangle: {
          properties: {
            regex:
              /^_|^(toCanvas|toImageData|auto|numeric|alphaNumeric|ascii|iso8859_1|shift_jis|utf8)$/,
          },
        },
      }),
    ],
  },
  {
    input: 'bin/cli.mjs',
    external: [/\/src\//],
    output: {
      file: 'build/cli.mjs',
      format: 'esm',
      paths: (p) => p.replace(/.+\/src\//, './'),
    },
    plugins,
  },
  {
    input: 'web/index.mjs',
    output: { file: 'web/build/index.min.js', format: 'esm' },
    plugins,
  },
];
