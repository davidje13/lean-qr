import { generate, mode } from './index.mjs';

const IMAGE_OPTIONS = { on: [0, 0, 0], off: [255, 255, 255] };
const VIRTUAL_CANVAS = { createImageData: (w, h) => new ImageData(w, h) };

beforeAll(async () => {
  assume(globalThis).hasProperty('BarcodeDetector');
  assume(await BarcodeDetector.getSupportedFormats()).contains('qr_code');
});

it(
  'generates barcodes which can be read by BarcodeDetector',
  {
    parameters: [
      { name: 'ascii', message: 'This is a simple test message' },
      { name: 'unicode', message: 'Unicode \uD83D\uDE00' },
      { name: 'numeric', message: '012345678901234567890123456789' },
      {
        name: 'mixed basic',
        expected: 'ABCDEF123',
        encoded: mode.multi(
          mode.alphaNumeric('ABC'),
          mode.ascii('DEF'),
          mode.numeric('123'),
        ),
      },

      // Temporarily disabling these as they fail to read on Chrome on M-series macs
      // See https://issues.chromium.org/issues/384033047
      //{ name: 'iso8859-1', message: 'ISO8859-1-compatible characters \u00A31.00' },
      //{ name: 'shift-jis', message: 'Kanji characters \u6F22\u5B57' },
      //{ name: 'mixed iso8859-1 and utf8', message: 'iso8859 \u00A3\u00A3\u00A3\u00A3\u00A3 then utf8 \u2026' },
    ],
  },
  async ({ message, expected = message, encoded = message }) => {
    const code = generate(encoded);
    const image = code.toImageData(VIRTUAL_CANVAS, IMAGE_OPTIONS);
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const detected = await detector.detect(image);
    expect(detected).hasLength(1);
    expect(detected[0].rawValue).equals(expected);
  },
);
