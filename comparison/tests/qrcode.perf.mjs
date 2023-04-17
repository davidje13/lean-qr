import { isBrowser, runPerformanceTest } from './common.mjs';

if (isBrowser) {
  const target = document.createElement('canvas');

  runPerformanceTest(
    'qrcode',
    () => import('../build/qrcode.browser.mjs'),
    (module) => (message) =>
      new Promise((resolve, reject) =>
        module.default.toCanvas(
          target,
          message,
          { errorCorrectionLevel: 'L' },
          (error) => (error ? reject(error) : resolve()),
        ),
      ),
  );
} else {
  runPerformanceTest(
    'qrcode',
    () => import('../build/qrcode.node.mjs'),
    (module) => (message) =>
      module.default.toString(message, { errorCorrectionLevel: 'L' }),
  );
}
