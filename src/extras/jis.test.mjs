import { shift_jis } from './jis.mjs';
import Bitmap1D from '../structures/Bitmap1D.mjs';
import { toMatchBits } from '../test-helpers/toMatchBits.mjs';

expect.extend({ toMatchBits });

describe('shift_jis', () => {
  it('stores the identifier and length', () => {
    const data = new Bitmap1D(10);
    shift_jis('')(data, 1);
    expect(data).toMatchBits(`
      1000
      00000000
    `);
  });

  it('uses a larger length for higher versions', () => {
    const data10 = new Bitmap1D(10);
    shift_jis('')(data10, 10);
    expect(data10.bits).toEqual(4 + 10);

    const data27 = new Bitmap1D(10);
    shift_jis('')(data27, 27);
    expect(data27.bits).toEqual(4 + 12);
  });

  it('encodes values in 13-bits', () => {
    const data = new Bitmap1D(10);
    shift_jis('\uff41\uff42\uff43')(data, 1); // full-width "abc"
    expect(data).toMatchBits(`
      1000
      00000011
      0000100000001
      0000100000010
      0000100000011
    `);
  });

  it('converts all supported values (shift-jis range)', () => {
    const data = new Bitmap1D(10);
    // smallest shift-jis codepoint to largest codepoint:
    shift_jis('\u3000\u7199')(data, 1); // ideographic space -- 'bright, splendid, glorious'
    expect(data).toMatchBits(`
      1000
      00000010
      0000000000000
      1111100100100
    `);
  });

  it('converts all supported values (unicode range)', () => {
    const data = new Bitmap1D(10);
    // smallest unicode codepoint to largest codepoint:
    shift_jis('\u00a7\uffe5')(data, 1); // section -- full-width yen sign
    expect(data).toMatchBits(`
      1000
      00000010
      0000001011000
      0000001001111
    `);
  });
});
