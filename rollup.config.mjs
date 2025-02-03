import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';

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
    output: { file: 'web/build/index.min.mjs', format: 'esm' },
    plugins,
  },
];
