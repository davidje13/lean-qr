import { runPerformanceTest } from './common.mjs';

runPerformanceTest(
  'qrcode-generator',
  () => import('../build/qrcode-generator.js'),
  (module) => (message) => {
    const code = module.default(0, 'L');
    code.addData(
      message,
      message.startsWith('A1') ? 'Alphanumeric' : undefined,
    );
    code.make();
    return code.createASCII();
  },
);
