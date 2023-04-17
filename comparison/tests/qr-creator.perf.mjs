import { isBrowser, runPerformanceTest } from './common.mjs';

if (isBrowser) {
  const target = document.createElement('canvas');

  runPerformanceTest(
    'qr-creator',
    () => import('../build/qr-creator.mjs'),
    // this API provides no way to know if it was successful or failed.
    // from manual testing, we see it only succeeds for the simple message.
    (module) => (message) => module.default.render({ text: message }, target),
  );
}
