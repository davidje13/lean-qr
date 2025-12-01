import { runPerformanceTest } from './common.mjs';

runPerformanceTest(
  'qr',
  () => import('../build/qr.mjs'),
  ({ default: encodeQR }) =>
    (message) =>
      encodeQR(message, 'term'),
);
