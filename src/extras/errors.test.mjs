import { readError } from './errors.mjs';
import { fail, ERROR_NO_DATA } from '../util.mjs';

describe('readError', () => {
  it('returns a human-friendly string for an error code', () => {
    let message;
    try {
      fail(ERROR_NO_DATA);
    } catch (e) {
      message = readError(e);
    }
    expect(message).equals('No data');
  });

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
