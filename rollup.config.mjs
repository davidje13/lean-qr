import terser from '@rollup/plugin-terser';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { strip } from './tools/rollup-plugin-strip.mjs';

const plugins = [];
if (process.env['TEST'] === 'true') {
  plugins.push(nodeResolve());
}
if (process.env['NO_MINIFY'] !== 'true') {
  plugins.push(
    terser({
      format: { ascii_only: true },
      mangle: { properties: { regex: /^_/ } },
    }),
  );
}

const target = (path) => ({
  input: `src/${path}.mjs`,
  output: { file: `build/${path}.mjs`, format: 'esm' },
  external: [/^node:/],
  plugins,
});

export default [
  target('index'),
  target('extras/svg'),
  target('extras/node_export'),
  target('extras/react'),
  target('extras/vue'),
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
            keep_quoted: 'strict',
            regex:
              /^_|^(toCanvas|toImageData|auto|numeric|alphaNumeric|ascii|iso8859_1|shift_jis|utf8|(min|max)(CorrectionLevel|Version)|mask|modes|on|off|pad)$/,
          },
        },
      }),
    ],
  },
  {
    input: 'src/nano.mjs',
    output: { file: 'build/nano.mjs', format: 'esm' },
    plugins: [
      strip('exclude-nano'),
      terser({
        format: { ascii_only: true },
        mangle: {
          properties: {
            keep_quoted: 'strict',
            regex: /^_|^(toImageData)$/,
          },
        },
      }),
    ],
  },
  {
    input: 'src/bin/cli.mjs',
    external: [/\/src\/(?!bin\/)/],
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
