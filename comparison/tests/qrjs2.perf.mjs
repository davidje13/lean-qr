import { isBrowser, runPerformanceTest } from './common.mjs';

if (!isBrowser) {
  // define document so that the import can succeed in NodeJS
  globalThis.document = {};
}

runPerformanceTest(
  'qrjs2',
  async () => {
    const module = await import('../build/qrjs2.js');
    return isBrowser ? { QRCode: window.QRCode } : module.default;
  },
  ({ QRCode }) =>
    (message) =>
      stringify(QRCode.generate(message)),
);

// qrjs2 does not include a string output, but testing without this step would
// give it an unfair performance advantage, so we have our own version for parity
function stringify(code) {
  let r = '';
  const s = code.length;
  for (let y = 0; y < s; ++y) {
    for (let x = 0; x < s; ++x) {
      r += code[y][x] ? '#' : ' ';
    }
    r += '\n';
  }
  return r;
}
