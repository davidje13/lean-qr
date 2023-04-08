import { mode } from './modes.mjs';
import { Bitmap1D } from '../../structures/Bitmap1D.mjs';
import { toMatchBits } from '../../test-helpers/toMatchBits.mjs';

expect.extend({ toMatchBits });

describe('mode.numeric', () => {
  it('stores the identifier and length', () => {
    const data = Bitmap1D();
    mode.numeric('')(data, 1);
    expect(data).toMatchBits(`
      0001
      0000000000
    `);
  });

  it('uses a larger length for higher versions', () => {
    const data10 = Bitmap1D();
    mode.numeric('')(data10, 10);
    expect(data10._bits).toEqual(4 + 12);

    const data27 = Bitmap1D();
    mode.numeric('')(data27, 27);
    expect(data27._bits).toEqual(4 + 14);
  });

  it('encodes values in triplets', () => {
    const data = Bitmap1D();
    mode.numeric('123000999')(data, 1);
    expect(data).toMatchBits(`
      0001
      0000001001
      0001111011
      0000000000
      1111100111
    `);
  });

  it('encodes 2 final characters in 7 bits', () => {
    const data = Bitmap1D();
    mode.numeric('99')(data, 1);
    expect(data).toMatchBits(`
      0001
      0000000010
      1100011
    `);
  });

  it('encodes 1 final character in 4 bits', () => {
    const data = Bitmap1D();
    mode.numeric('9')(data, 1);
    expect(data).toMatchBits(`
      0001
      0000000001
      1001
    `);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.numeric('1234567890'));
  });

  it('accepts digits', () => {
    expect(mode.numeric.test('0')).isTruthy();
    expect(mode.numeric.test('5')).isTruthy();
    expect(mode.numeric.test('9')).isTruthy();
    expect(mode.numeric.test('a')).isFalsy();
    expect(mode.numeric.test('.')).isFalsy();
    expect(mode.numeric.test(' ')).isFalsy();
    expect(mode.numeric.test('\uFFFD')).isFalsy();
  });

  it('estimates accurately', () => {
    expectEstMatch(mode.numeric, '');
    expectEstMatch(mode.numeric, '0000');
    expectEstMatch(mode.numeric, '00000');
    expectEstMatch(mode.numeric, '000000');
  });
});

describe('mode.alphaNumeric', () => {
  it('stores the identifier and length', () => {
    const data = Bitmap1D();
    mode.alphaNumeric('')(data, 1);
    expect(data).toMatchBits(`
      0010
      000000000
    `);
  });

  it('uses a larger length for higher versions', () => {
    const data10 = Bitmap1D();
    mode.alphaNumeric('')(data10, 10);
    expect(data10._bits).toEqual(4 + 11);

    const data27 = Bitmap1D();
    mode.alphaNumeric('')(data27, 27);
    expect(data27._bits).toEqual(4 + 13);
  });

  it('encodes values in pairs', () => {
    const data = Bitmap1D();
    mode.alphaNumeric('AB00::')(data, 1);
    expect(data).toMatchBits(`
      0010
      000000110
      00111001101
      00000000000
      11111101000
    `);
  });

  it('encodes 1 final character in 6 bits', () => {
    const data = Bitmap1D();
    mode.alphaNumeric(':')(data, 1);
    expect(data).toMatchBits(`
      0010
      000000001
      101100
    `);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.alphaNumeric('ABC123:'));
  });

  it('accepts upper case characters, numbers, and some symbols', () => {
    expect(mode.alphaNumeric.test('A')).isTruthy();
    expect(mode.alphaNumeric.test('5')).isTruthy();
    expect(mode.alphaNumeric.test(' ')).isTruthy();
    expect(mode.alphaNumeric.test('.')).isTruthy();
    expect(mode.alphaNumeric.test('a')).isFalsy();
    expect(mode.alphaNumeric.test('\n')).isFalsy();
    expect(mode.alphaNumeric.test('!')).isFalsy();
    expect(mode.alphaNumeric.test('\uFFFD')).isFalsy();
  });

  it('estimates accurately', () => {
    expectEstMatch(mode.alphaNumeric, '');
    expectEstMatch(mode.alphaNumeric, 'ABC');
    expectEstMatch(mode.alphaNumeric, 'ABCD');
  });
});

describe('mode.ascii', () => {
  it('stores the identifier and length', () => {
    const data = Bitmap1D();
    mode.ascii('')(data, 1);
    expect(data).toMatchBits(`
      0100
      00000000
    `);
  });

  it('uses a larger length for higher versions', () => {
    const data10 = Bitmap1D();
    mode.ascii('')(data10, 10);
    expect(data10._bits).toEqual(4 + 16);

    const data27 = Bitmap1D();
    mode.ascii('')(data27, 27);
    expect(data27._bits).toEqual(4 + 16);
  });

  it('encodes values in 8 bit ISO-8859-1 encoding', () => {
    const data = Bitmap1D();
    mode.ascii('ab')(data, 1);
    expect(data).toMatchBits(`
      0100
      00000010
      01100001
      01100010
    `);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.ascii('abc123'));
  });

  it('accepts 7-bit ascii characters', () => {
    expect(mode.ascii.test('A')).isTruthy();
    expect(mode.ascii.test('5')).isTruthy();
    expect(mode.ascii.test(' ')).isTruthy();
    expect(mode.ascii.test('\n')).isTruthy();
    expect(mode.ascii.test('\u0000')).isTruthy();
    expect(mode.ascii.test('\u007F')).isTruthy();
    expect(mode.ascii.test('\u0080')).isFalsy();
    expect(mode.ascii.test('\uFFFD')).isFalsy();
  });

  it('estimates accurately', () => {
    expectEstMatch(mode.ascii, '');
    expectEstMatch(mode.ascii, 'abc123');
  });
});

describe('mode.iso8859_1', () => {
  it('stores an ECI mode, the identifier and length', () => {
    const data = Bitmap1D();
    mode.iso8859_1('')(data, 1);
    expect(data).toMatchBits(`
      0111
      00000011

      0100
      00000000
    `);
  });

  it('uses a larger length for higher versions', () => {
    const data10 = Bitmap1D();
    mode.iso8859_1('')(data10, 10);
    expect(data10._bits).toEqual(12 + 4 + 16);

    const data27 = Bitmap1D();
    mode.iso8859_1('')(data27, 27);
    expect(data27._bits).toEqual(12 + 4 + 16);
  });

  it('encodes values in 8 bit ISO-8859-1 encoding', () => {
    const data = Bitmap1D();
    mode.iso8859_1('ab\u00A3\u00FF')(data, 1);
    expect(data).toMatchBits(`
      0111
      00000011

      0100
      00000100
      01100001
      01100010
      10100011
      11111111
    `);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.iso8859_1('abc123'));
  });

  it('accepts 8-bit characters', () => {
    expect(mode.iso8859_1.test('A')).isTruthy();
    expect(mode.iso8859_1.test('5')).isTruthy();
    expect(mode.iso8859_1.test(' ')).isTruthy();
    expect(mode.iso8859_1.test('\n')).isTruthy();
    expect(mode.iso8859_1.test('\u0000')).isTruthy();
    expect(mode.iso8859_1.test('\u00FF')).isTruthy();
    expect(mode.iso8859_1.test('\u0100')).isFalsy();
    expect(mode.iso8859_1.test('\uFFFD')).isFalsy();
  });

  it('estimates accurately', () => {
    expectEstMatch(mode.iso8859_1, '');
    expectEstMatch(mode.iso8859_1, 'abc123');
  });
});

describe('mode.shift_jis', () => {
  it('stores the identifier and length', () => {
    const data = Bitmap1D();
    mode.shift_jis('')(data, 1);
    expect(data).toMatchBits(`
      1000
      00000000
    `);
  });

  it('uses a larger length for higher versions', () => {
    const data10 = Bitmap1D();
    mode.shift_jis('')(data10, 10);
    expect(data10._bits).toEqual(4 + 10);

    const data27 = Bitmap1D();
    mode.shift_jis('')(data27, 27);
    expect(data27._bits).toEqual(4 + 12);
  });

  it('encodes values in 13-bits', () => {
    const data = Bitmap1D();
    mode.shift_jis('\uFF41\uFF42\uFF43')(data, 1); // full-width "abc"
    expect(data).toMatchBits(`
      1000
      00000011
      0000100000001
      0000100000010
      0000100000011
    `);
  });

  it('converts all supported values (shift-jis range)', () => {
    const data = Bitmap1D();
    // smallest shift-jis codepoint to largest codepoint:
    mode.shift_jis('\u3000\u7199')(data, 1); // ideographic space -- 'bright, splendid, glorious'
    expect(data).toMatchBits(`
      1000
      00000010
      0000000000000
      1111100100100
    `);
  });

  it('converts all supported values (unicode range)', () => {
    const data = Bitmap1D();
    // smallest unicode codepoint to largest codepoint:
    mode.shift_jis('\u00A7\uFFE5')(data, 1); // section -- full-width yen sign
    expect(data).toMatchBits(`
      1000
      00000010
      0000001011000
      0000001001111
    `);
  });

  it('accepts 2-byte shift-JIS characters', () => {
    expect(mode.shift_jis.test('\u3000')).isTruthy();
    expect(mode.shift_jis.test('\u7199')).isTruthy();
    expect(mode.shift_jis.test('\u00A7')).isTruthy();
    expect(mode.shift_jis.test('\uFFE5')).isTruthy();
    expect(mode.shift_jis.test('.')).isFalsy();
    expect(mode.shift_jis.test(' ')).isFalsy();
    expect(mode.shift_jis.test('a')).isFalsy();
    expect(mode.shift_jis.test('\u0000')).isFalsy();
    expect(mode.shift_jis.test('\uFFFF')).isFalsy();
    expect(mode.shift_jis.test('\uFFFD')).isFalsy();
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.shift_jis('\uFF41'));
  });

  it('estimates accurately', () => {
    expectEstMatch(mode.shift_jis, '');
    expectEstMatch(mode.shift_jis, '\u3000');
  });
});

describe('mode.utf8', () => {
  it('stores the ECI mode, identifier and length', () => {
    const data = Bitmap1D();
    mode.utf8('')(data, 1);
    expect(data).toMatchBits(`
      0111
      00011010
      0100
      00000000
    `);
  });

  it('does not store the ECI mode if it is already correct', () => {
    const data = Bitmap1D();
    mode.multi(mode.utf8(''), mode.utf8(''))(data, 1);
    expect(data).toMatchBits(`
      0111
      00011010
      0100
      00000000
      0100
      00000000
    `);
  });

  it('encodes values in 8 bit UTF8 encoding', () => {
    const data = Bitmap1D();
    mode.utf8('\u2026')(data, 1);
    expect(data).toMatchBits(`
      0111
      00011010
      0100
      00000011
      11100010
      10000000
      10100110
    `);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.utf8('unicode\u2026'));
  });

  it('accepts all characters', () => {
    expect(mode.utf8.test('A')).isTruthy();
    expect(mode.utf8.test('5')).isTruthy();
    expect(mode.utf8.test(' ')).isTruthy();
    expect(mode.utf8.test('\n')).isTruthy();
    expect(mode.utf8.test('\u0000')).isTruthy();
    expect(mode.utf8.test('\uFFFF')).isTruthy();
  });

  it('estimates accurately', () => {
    expectEstMatch(mode.utf8, '');
    expectEstMatch(mode.utf8, 'abc123');
    expectEstMatch(mode.utf8, '\uFFFF');
  });
});

describe('mode.multi', () => {
  it('appends multiple modes in succession', () => {
    const data = Bitmap1D();
    mode.multi(mode.numeric('0'), mode.numeric('9'))(data, 1);
    expect(data).toMatchBits(`
      0001
      0000000001
      0000

      0001
      0000000001
      1001
    `);
  });

  it('passes version information down', () => {
    const data = Bitmap1D();
    mode.multi(mode.numeric(''))(data, 40);
    expect(data._bits).toEqual(4 + 14);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() =>
      mode.multi(mode.numeric('123'), mode.alphaNumeric('ABC')),
    );
  });
});

describe('mode.auto', () => {
  function checkSame(actual, expected, version = 20) {
    const actualData = Bitmap1D();
    const expectedData = Bitmap1D();
    actual(actualData, version);
    expected(expectedData, version);

    expect(actualData).toMatchBits(expectedData);
  }

  it('uses smaller encodings if possible', () => {
    checkSame(mode.auto('123'), mode.numeric('123'));
  });

  it('uses larger encodings if needed', () => {
    checkSame(mode.auto('abc'), mode.ascii('abc'));
    checkSame(mode.auto('iso \u00A3'), mode.iso8859_1('iso \u00A3'));
  });

  it('uses utf8 if nothing else will do', () => {
    checkSame(
      mode.auto('unicode \uD83D\uDE00'),
      mode.utf8('unicode \uD83D\uDE00'),
    );
  });

  it('is restricted to the modes given', () => {
    checkSame(
      mode.auto('123', { modes: [mode.alphaNumeric, mode.iso8859_1] }),
      mode.alphaNumeric('123'),
    );
  });

  it('rejects impossible input', () => {
    const data = Bitmap1D();
    expect(() =>
      mode.auto('nope', { modes: [mode.alphaNumeric] })(data, 10),
    ).toThrow('lean-qr error 5');
  });

  it('rejects impossible iso8859_1 input', () => {
    const data = Bitmap1D();
    expect(() =>
      mode.auto('nah\u2026', { modes: [mode.iso8859_1] })(data, 10),
    ).toThrow('lean-qr error 5');
  });

  it('picks the best combination of modes to minimise the resulting size', () => {
    checkSame(
      mode.auto('abcabcabcabcabc12345678901234567890'),
      mode.multi(
        mode.ascii('abcabcabcabcabc'),
        mode.numeric('12345678901234567890'),
      ),
    );
  });

  it('can combine utf8 with other modes', () => {
    checkSame(
      mode.auto('\uD83D\uDE00 00000000000000000'),
      mode.multi(mode.utf8('\uD83D\uDE00 '), mode.numeric('00000000000000000')),
    );
  });

  it('avoids combining utf8 with iso8859', () => {
    checkSame(
      mode.auto(
        'lots of text which could be utf8 or iso8859 but then: \uD83D\uDE00',
      ),
      mode.utf8(
        'lots of text which could be utf8 or iso8859 but then: \uD83D\uDE00',
      ),
    );
  });

  it('combines utf8 with iso8859 if beneficial', () => {
    checkSame(
      mode.auto(
        'iso8859 \u00A3\u00A3\u00A3\u00A3\u00A3 then utf8 \uD83D\uDE00',
      ),
      mode.multi(
        mode.iso8859_1('iso8859 \u00A3\u00A3\u00A3\u00A3\u00A3 then utf8 '),
        mode.utf8('\uD83D\uDE00'),
      ),
    );
  });

  it('handles the trivial case of empty input', () => {
    checkSame(mode.auto(''), mode.multi());
  });

  it('does not switch encoding type for no benefit', () => {
    checkSame(mode.auto('abc123'), mode.ascii('abc123'));

    checkSame(mode.auto('123abc'), mode.ascii('123abc'));
  });

  it('can switch mode multiple times if beneficial', () => {
    checkSame(
      mode.auto('1&234567890&1234567890&ABCABCABCABCABCABCabc'),
      mode.multi(
        mode.ascii('1&'),
        mode.numeric('234567890'),
        mode.ascii('&'),
        mode.numeric('1234567890'),
        mode.ascii('&'),
        mode.alphaNumeric('ABCABCABCABCABCABC'),
        mode.ascii('abc'),
      ),
    );
  });

  const KANJI_STRING = '\u6F22\u5B57'; // 漢字 "Kanji"

  it('prefers shift-jis for supported characters when available', () => {
    checkSame(mode.auto(KANJI_STRING), mode.shift_jis(KANJI_STRING));
  });

  it('avoids shift-jis for unsupported characters', () => {
    checkSame(mode.auto('\uFC00'), mode.utf8('\uFC00'));
  });

  it('switches between shift-jis and other modes as required', () => {
    const input = `abc ${KANJI_STRING} def`;
    checkSame(
      mode.auto(input),
      mode.multi(
        mode.ascii('abc '),
        mode.shift_jis(KANJI_STRING),
        mode.ascii(' def'),
      ),
    );
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.auto('ABCDEFGHIJKL1234567890'));
    expectRepeatable(() => mode.auto('needs unicode\u2026'));
  });
});

function expectRepeatable(encoderFactory) {
  const encoder1 = encoderFactory();
  const encoder2 = encoderFactory();
  const data1 = Bitmap1D();
  const data2 = Bitmap1D();

  encoder1(data1, 1);
  encoder1(data2, 1);
  expect(data2).toMatchBits(data1); // exact repeat

  const data3 = Bitmap1D();
  const data4 = Bitmap1D();
  encoder1(data3, 40);
  encoder2(data4, 40);
  expect(data3).toMatchBits(data4); // version change
}

function expectEstMatch(mode, value) {
  const encoder = mode(value);

  for (let version = 1; version <= 40; ++version) {
    const data = Bitmap1D();
    data.eci = mode.eci; // do not include ECI changes
    const est = mode.est(value, version);
    encoder(data, version);
    expect(Math.ceil(est)).equals(data._bits);
  }
}
