import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

// We perform a minimal build of the dependencies which are not pre-packaged.
// Note that minification is NOT applied here; we measure the size of the
// library as distributed, rather than the size with any particular minifier.

export default [
  {
    input: './node_modules/qr.js/index.js',
    output: [{ file: 'build/qrjs.mjs', format: 'esm' }],
    plugins: [commonjs()],
  },
  {
    input: './node_modules/qrcode/lib/index.js',
    output: [{ file: 'build/qrcode.node.mjs', format: 'esm' }],
    plugins: [commonjs(), nodeResolve({ preferBuiltins: true })],
  },
  {
    input: './node_modules/qrcode/lib/browser.js',
    output: [{ file: 'build/qrcode.browser.mjs', format: 'esm' }],
    plugins: [commonjs(), nodeResolve({ preferBuiltins: false })],
  },
];
