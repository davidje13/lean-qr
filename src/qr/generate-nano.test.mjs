import { generate as generateNano } from './generate-nano.mjs';
import { generate as generateFull } from './generate.mjs';
import { mode } from './options/modes.mjs';
import { correction } from './options/corrections.mjs';
import { toMatchImage } from '../test-helpers/toMatchImage.mjs';

expect.extend({ toMatchImage });

const V4_MESSAGE =
  'this is a much longer message which needs at least version 4';

describe('nano generate', () => {
  it(
    'matches the output of full generate',
    ({ message, options, fullOptions }) => {
      const nanoCode = generateNano(message, options);
      const fullCode = generateFull(mode.utf8(message), fullOptions ?? options);
      expect(nanoCode).toMatchImage(
        fullCode.toString({ on: '#', off: ' ', pad: 0 }),
      );
    },
    {
      parameters: [
        {
          name: 'plain text is encoded as utf8',
          message: 'hello',
          options: { minCorrectionLevel: correction.H },
        },
        {
          name: 'custom correction level',
          message: 'hello',
          options: { minCorrectionLevel: correction.M },
          fullOptions: {
            minCorrectionLevel: correction.M,
            maxCorrectionLevel: correction.M,
          },
        },
        {
          name: 'fixed parameters',
          message: 'hello',
          options: { minVersion: 1, minCorrectionLevel: correction.Q },
          fullOptions: {
            minCorrectionLevel: correction.Q,
            maxCorrectionLevel: correction.Q,
          },
        },
        {
          name: 'long message',
          message: V4_MESSAGE,
          options: { minCorrectionLevel: correction.H },
        },
        {
          name: 'allows larger versions to be forced',
          message: V4_MESSAGE,
          options: { minVersion: 10, minCorrectionLevel: correction.H },
        },
        {
          name: 'message with 2-byte length',
          message: 'a'.repeat(260),
          options: { minCorrectionLevel: correction.H },
        },
      ],
    },
  );

  it('throws if given no input', () => {
    expect(() => generateNano()).toThrow('lean-qr error 1');
  });

  it('throws if given unsupported input', () => {
    expect(() => generateNano(mode.ascii('nope'))).toThrow('lean-qr error 5');
  });

  it('throws if given too much data', () => {
    expect(() => generateNano('x'.repeat(2952))).not(toThrow());
    expect(() => generateNano('x'.repeat(2953))).toThrow('lean-qr error 4');
  });
});
