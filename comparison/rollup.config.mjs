import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: './node_modules/qr.js/index.js',
    output: [
      { file: 'build/qrjs.mjs', format: 'esm' },
      { file: 'build/qrjs.js', format: 'cjs' },
    ],
    plugins: [commonjs()],
  },
  {
    input: './node_modules/qrcode/lib/index.js',
    output: [
      { file: 'build/qrcode.mjs', format: 'esm' },
      { file: 'build/qrcode.js', format: 'cjs' },
    ],
    plugins: [commonjs(), nodeResolve()],
  },
];
