import { runPerformanceTest } from './common.mjs';

runPerformanceTest(
  'lean-qr',
  () => import('../build/lean-qr.mjs'),
  ({ generate }) =>
    (message) =>
      generate(message).toString(),
);
