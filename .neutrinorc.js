const airbnbBase = require('@neutrinojs/airbnb-base');
const library = require('@neutrinojs/library');
const jest = require('@neutrinojs/jest');

module.exports = {
  options: {
    root: __dirname,
    tests: 'src',
  },
  use: [
    airbnbBase({
      eslint: {
        rules: {
          'arrow-parens': ['error', 'always'],
          'operator-linebreak': ['error', 'after'],
          'jest/expect-expect': ['off'],
          'import/extensions': ['error', 'always'],
          'no-bitwise': ['off'],
          'no-plusplus': ['off'],
          'no-continue': ['off'],
          'no-nested-ternary': ['off'],
          'no-control-regex': ['off'],
          'no-multi-assign': ['off'],
          'no-loop-func': ['off'],
        },
      },
    }),
    library({
      name: 'lean-qr',
      target: 'node',
      babel: {
        presets: [
          ['@babel/preset-env', {
            useBuiltIns: false,
            targets: {
              node: '10.15',
              browsers: [
                'last 1 chrome version',
                'last 1 firefox version',
                'last 1 ios version',
//                'last 1 edge version',
//                'last 1 safari version',
              ],
            },
          }],
        ],
      },
    }),
    jest(),
  ],
};
