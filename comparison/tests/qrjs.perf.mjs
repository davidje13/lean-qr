import { runPerformanceTest } from './common.mjs';

runPerformanceTest(
  'qr.js',
  () => import('../build/qrjs.mjs'),
  (module) => (message) => module.default(message),
);
