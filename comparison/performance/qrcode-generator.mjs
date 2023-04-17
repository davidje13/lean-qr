#!/usr/bin/env -S node --disable-proto delete --disallow-code-generation-from-strings

import { out, runPerformanceTest } from './common.mjs';

const tm0 = performance.now();
const module = await import('../node_modules/qrcode-generator/qrcode.js');
const tm1 = performance.now();
out(`Load / init time: ${(tm1 - tm0).toFixed(1)}ms\n`);

await runPerformanceTest((message) => {
  const code = module.default(0, 'L');
  code.addData(message, message.startsWith('A1') ? 'Alphanumeric' : undefined);
  code.make();
  code.createASCII();
});
