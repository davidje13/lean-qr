import { runPerformanceTest } from './common.mjs';

runPerformanceTest(
  'qr.js',
  () => import('../build/qrjs.mjs'),
  (module) => (message) => stringify(module.default(message)),
);

// qr.js does not include a string output, but testing without this step would
// give it an unfair performance advantage, so we have our own version for parity
function stringify(code) {
  let r = '';
  const s = code.modules.length;
  for (let y = 0; y < s; ++y) {
    for (let x = 0; x < s; ++x) {
      r += code.modules[y][x] ? '#' : ' ';
    }
    r += '\n';
  }
  return r;
}
