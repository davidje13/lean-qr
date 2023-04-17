import { runPerformanceTest } from './common.mjs';

runPerformanceTest(
  'lean-qr/nano',
  () => import('../build/lean-qr-nano.mjs'),
  ({ generate }) =>
    (message) =>
      stringify(generate(message)),
);

// nano export does not include a toString method, but testing without this step would
// give it an unfair performance advantage, so we have our own version for parity
function stringify(code) {
  let r = '';
  const s = code.size;
  for (let y = -4; y < s + 4; ++y) {
    for (let x = -4; x < s + 4; ++x) {
      r += code.get(x, y) ? '#' : ' ';
    }
    r += '\n';
  }
  return r;
}
