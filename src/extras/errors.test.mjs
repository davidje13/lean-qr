import {
  fail,
  ERROR_NO_DATA,
  ERROR_INVALID_VERSION_RANGE,
  ERROR_INVALID_ERROR_CORRECTION_RANGE,
  ERROR_TOO_MUCH_DATA,
  ERROR_UNENCODABLE,
  ERROR_BAD_FRAMEWORK,
  ERROR_BAD_GENERATE,
  ERROR_BAD_TO_SVG_DATA_URL,
} from '../util.mjs';
import { readError } from './errors.mjs';

describe('readError', () => {
  it(
    'returns a human-friendly string for an error code',
    ({ code, expected }) => {
      let message;
      try {
        fail(code);
      } catch (e) {
        message = readError(e);
      }
      expect(message).equals(expected);
    },
    {
      parameters: [
        { code: ERROR_NO_DATA, expected: 'No data' },
        { code: ERROR_INVALID_VERSION_RANGE, expected: 'Bad version range' },
        {
          code: ERROR_INVALID_ERROR_CORRECTION_RANGE,
          expected: 'Bad error correction range',
        },
        { code: ERROR_TOO_MUCH_DATA, expected: 'Too much data' },
        {
          code: ERROR_UNENCODABLE,
          expected: 'Data cannot be encoded using requested modes',
        },
        { code: ERROR_BAD_FRAMEWORK, expected: 'Bad framework' },
        { code: ERROR_BAD_GENERATE, expected: 'Bad generate function' },
        {
          code: ERROR_BAD_TO_SVG_DATA_URL,
          expected: 'Bad toSvgDataURL function',
        },
      ],
    },
  );

  it('returns the error message for unrecognised codes', () => {
    let message;
    try {
      fail(-1);
    } catch (e) {
      message = readError(e);
    }
    expect(message).equals('lean-qr error -1');
  });

  it('returns the error message for other errors', () => {
    let message;
    try {
      throw new Error('nope');
    } catch (e) {
      message = readError(e);
    }
    expect(message).equals('nope');
  });

  it('returns the stringified object for non-errors', () => {
    let message;
    try {
      throw 'plain string';
    } catch (e) {
      message = readError(e);
    }
    expect(message).equals('plain string');
  });

  it('returns Unknown for errors with no information', () => {
    let message;
    try {
      throw new Error();
    } catch (e) {
      message = readError(e);
    }
    expect(message).equals('Unknown error');
  });
});
