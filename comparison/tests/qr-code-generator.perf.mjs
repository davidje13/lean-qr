import { isBrowser, loadGlobalScript, runPerformanceTest } from './common.mjs';

if (isBrowser) {
  runPerformanceTest(
    'qr-code-generator',
    // QR-Code-Generator defines a value rather than an export or a window global;
    // we have to load it as a classic script
    () =>
      loadGlobalScript('../build/qr-code-generator.js', () =>
        typeof qrcodegen !== 'undefined' ? qrcodegen : undefined,
      ),
    ({ QrCode }) =>
      (message) =>
        stringify(QrCode.encodeText(message, QrCode.Ecc.LOW)),
  );
}

// qr-code-generator only includes API output, but testing without the drawing step would
// give it an unfair performance advantage, so we have our own version for parity
function stringify(code) {
  let r = '';
  const s = code.size;
  for (let y = -4; y < s + 4; ++y) {
    for (let x = -4; x < s + 4; ++x) {
      r += code.getModule(x, y) ? '#' : ' ';
    }
    r += '\n';
  }
  return r;
}
