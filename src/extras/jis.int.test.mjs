import generate from '../qr/generate.mjs';
import mode from '../qr/options/modes.mjs';
import { names as correction } from '../qr/options/corrections.mjs';
import Bitmap1D from '../structures/Bitmap1D.mjs';
import { loadImage, toMatchImage } from '../test-helpers/images.mjs';
import { toMatchBits } from '../test-helpers/toMatchBits.mjs';
import { shift_jis } from './jis.mjs';

expect.extend({ toMatchBits, toMatchImage });

const KANJI_STRING = '\u6f22\u5b57'; // 漢字 "Kanji"
const MODE_CONFIG = {
  modes: [
    mode.numeric,
    mode.alphaNumeric,
    mode.iso8859_1,
    shift_jis,
    mode.utf8,
  ],
};

describe('mode.auto', () => {
  function checkSame(actual, expected, version = 20) {
    const actualData = new Bitmap1D(1000);
    const expectedData = new Bitmap1D(1000);
    actual(actualData, version);
    expected(expectedData, version);

    expect(actualData).toMatchBits(expectedData);
  }

  it('does not use shift-jis by default', () => {
    checkSame(mode.auto(KANJI_STRING), mode.utf8(KANJI_STRING));
  });

  it('prefers shift-jis for supported characters when available', () => {
    checkSame(mode.auto(KANJI_STRING, MODE_CONFIG), shift_jis(KANJI_STRING));
  });

  it('avoids shift-jis for unsupported characters', () => {
    checkSame(mode.auto('\uFC00', MODE_CONFIG), mode.utf8('\uFC00'));
  });

  it('switches between shift-jis and other modes as required', () => {
    const input = 'abc \u6f22\u5b57 def';
    checkSame(
      mode.auto(input, MODE_CONFIG),
      mode.multi(
        mode.iso8859_1('abc '),
        shift_jis('\u6f22\u5b57'),
        mode.iso8859_1(' def'),
      ),
    );
  });
});

describe('known examples', () => {
  it('Kanji', () => {
    const code = generate(shift_jis(KANJI_STRING), {
      minCorrectionLevel: correction.H,
      maxCorrectionLevel: correction.H,
      minVersion: 1,
      maxVersion: 1,
      mask: 1,
    });
    expect(code).toMatchImage(loadImage('kanji.png'));
  });
});
