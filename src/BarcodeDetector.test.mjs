import { generate as rawGenerate } from './index.mjs';
import { shift_jis } from './extras/jis.mjs';

const generate = rawGenerate.with(shift_jis);
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
      'This is a simple test message',
      'Unicode \uD83D\uDE00',
      'ISO8859-compatible characters \u00A31.00',
      'Kanji characters \u6F22\u5B57',
      '012345678901234567890123456789',
      'iso8859 \u00A3\u00A3\u00A3\u00A3\u00A3 then utf8 \u2026',
    ],
  },
  async (message) => {
    const code = generate(message);
    const image = code.toImageData(VIRTUAL_CANVAS, IMAGE_OPTIONS);
    const detector = new BarcodeDetector({ formats: ['qr_code'] });
    const detected = await detector.detect(image);
    expect(detected).hasLength(1);
    expect(detected[0].rawValue).equals(message);
  },
);
