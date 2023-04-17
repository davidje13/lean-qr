import { runPerformanceTest } from './common.mjs';

runPerformanceTest(
  'awesome-qr',
  () => import('../build/awesome-qr.js'),
  (module) => (message) =>
    new module.default.AwesomeQR({ text: message }).draw(),
);
