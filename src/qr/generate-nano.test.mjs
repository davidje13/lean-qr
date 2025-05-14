import { generate as generateNano } from './generate-nano.mjs';
import { generate as generateFull } from './generate.mjs';
import { mode } from './options/modes.mjs';
import { correction } from './options/corrections.mjs';
import { toMatchImage } from '../test-helpers/toMatchImage.mjs';

expect.extend({ toMatchImage });

const LONG_MESSAGE =
  'this is a much longer message which needs at least version 4';

it(
  'nano generate matches the output of full generate',
  ({ message, options, fullMessage, fullOptions }) => {
    const nanoCode = generateNano(message, options);
    const fullCode = generateFull(
      fullMessage ?? message,
      fullOptions ?? options,
    );
    expect(nanoCode).toMatchImage(
      fullCode.toString({ on: '#', off: ' ', padX: 0, padY: 0 }),
    );
  },
  {
    parameters: [
      {
        name: 'plain text is encoded as utf8',
        message: 'hello',
        options: { minCorrectionLevel: correction.max },
        fullMessage: mode.utf8('hello'),
      },
      {
        name: 'custom correction level',
        message: 'hello',
        options: { minCorrectionLevel: correction.M },
        fullMessage: mode.utf8('hello'),
        fullOptions: {
          minCorrectionLevel: correction.M,
          maxCorrectionLevel: correction.M,
        },
      },
      {
        name: 'explicit ASCII message with fixed parameters',
        message: mode.ascii('hello'),
        options: { minVersion: 1, minCorrectionLevel: correction.Q },
        fullOptions: {
          minCorrectionLevel: correction.Q,
          maxCorrectionLevel: correction.Q,
        },
      },
      {
        name: 'long message',
        message: mode.ascii(LONG_MESSAGE),
        options: { minCorrectionLevel: correction.max },
      },
      {
        name: 'allows larger versions to be forced',
        message: mode.ascii(LONG_MESSAGE),
        options: { minVersion: 10, minCorrectionLevel: correction.max },
      },
    ],
  },
);
