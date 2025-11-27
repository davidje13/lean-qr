import { isBrowser, runPerformanceTest } from './common.mjs';

runPerformanceTest(
  'qruri',
  () =>
    isBrowser
      ? import('../build/qruri-browser.js')
      : import('../build/qruri-node.js'),
  (module) => (message) => module.default(message, {}),
);
