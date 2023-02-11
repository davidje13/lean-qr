import mode from './modes.mjs';
import Bitmap1D from '../../structures/Bitmap1D.mjs';
import { toMatchBits } from '../../test-helpers/toMatchBits.mjs';

expect.extend({ toMatchBits });

describe('mode.numeric', () => {
  it('stores the identifier and length', () => {
    const data = new Bitmap1D(10);
    mode.numeric('')(data, 1);
    expect(data).toMatchBits(`
      0001
      0000000000
    `);
  });

  it('uses a larger length for higher versions', () => {
    const data10 = new Bitmap1D(10);
    mode.numeric('')(data10, 10);
    expect(data10.bits).toEqual(4 + 12);

    const data27 = new Bitmap1D(10);
    mode.numeric('')(data27, 27);
    expect(data27.bits).toEqual(4 + 14);
  });

  it('encodes values in triplets', () => {
    const data = new Bitmap1D(10);
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
    const data = new Bitmap1D(10);
    mode.numeric('99')(data, 1);
    expect(data).toMatchBits(`
      0001
      0000000010
      1100011
    `);
  });

  it('encodes 1 final character in 4 bits', () => {
    const data = new Bitmap1D(10);
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
});

describe('mode.alphaNumeric', () => {
  it('stores the identifier and length', () => {
    const data = new Bitmap1D(10);
    mode.alphaNumeric('')(data, 1);
    expect(data).toMatchBits(`
      0010
      000000000
    `);
  });

  it('uses a larger length for higher versions', () => {
    const data10 = new Bitmap1D(10);
    mode.alphaNumeric('')(data10, 10);
    expect(data10.bits).toEqual(4 + 11);

    const data27 = new Bitmap1D(10);
    mode.alphaNumeric('')(data27, 27);
    expect(data27.bits).toEqual(4 + 13);
  });

  it('encodes values in pairs', () => {
    const data = new Bitmap1D(10);
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
    const data = new Bitmap1D(10);
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
});

describe('mode.iso8859_1', () => {
  it('stores the identifier and length', () => {
    const data = new Bitmap1D(10);
    mode.iso8859_1('')(data, 1);
    expect(data).toMatchBits(`
      0100
      00000000
    `);
  });

  it('uses a larger length for higher versions', () => {
    const data10 = new Bitmap1D(10);
    mode.iso8859_1('')(data10, 10);
    expect(data10.bits).toEqual(4 + 16);

    const data27 = new Bitmap1D(10);
    mode.iso8859_1('')(data27, 27);
    expect(data27.bits).toEqual(4 + 16);
  });

  it('encodes values in 8 bit ISO-8859-1 encoding', () => {
    const data = new Bitmap1D(10);
    mode.iso8859_1('ab\u00A3\u00FF')(data, 1);
    expect(data).toMatchBits(`
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
});

describe('mode.utf8', () => {
  it('stores the ECI mode, identifier and length', () => {
    const data = new Bitmap1D(10);
    mode.utf8('')(data, 1);
    expect(data).toMatchBits(`
      0111
      00011010
      0100
      00000000
    `);
  });

  it('encodes values in 8 bit UTF8 encoding', () => {
    const data = new Bitmap1D(10);
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
});

describe('mode.multi', () => {
  it('appends multiple modes in succession', () => {
    const data = new Bitmap1D(10);
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
    const data = new Bitmap1D(10);
    mode.multi(mode.numeric(''))(data, 40);
    expect(data.bits).toEqual(4 + 14);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() =>
      mode.multi(mode.numeric('123'), mode.alphaNumeric('ABC')),
    );
  });
});

describe('mode.auto', () => {
  function checkSame(actual, expected, version = 20) {
    const actualData = new Bitmap1D(1000);
    const expectedData = new Bitmap1D(1000);
    actual(actualData, version);
    expected(expectedData, version);

    expect(actualData).toMatchBits(expectedData);
  }

  it('uses smaller encodings if possible', () => {
    checkSame(mode.auto('123'), mode.numeric('123'));
  });

  it('uses larger encodings if needed', () => {
    checkSame(mode.auto('abc'), mode.iso8859_1('abc'));
  });

  it('uses utf8 if nothing else will do', () => {
    checkSame(mode.auto('unicode\u2026'), mode.utf8('unicode\u2026'));
  });

  it('is restricted to the modes given', () => {
    checkSame(
      mode.auto('123', { modes: [mode.alphaNumeric, mode.iso8859_1] }),
      mode.alphaNumeric('123'),
    );
  });

  it('rejects impossible input', () => {
    const data = new Bitmap1D(1000);
    expect(() =>
      mode.auto('nope', { modes: [mode.alphaNumeric] })(data, 10),
    ).toThrow('Unencodable');
  });

  it('rejects impossible iso8859_1 input', () => {
    const data = new Bitmap1D(1000);
    expect(() =>
      mode.auto('nah\u2026', { modes: [mode.iso8859_1] })(data, 10),
    ).toThrow('Unencodable');
  });

  it('picks the best combination of modes to minimise the resulting size', () => {
    checkSame(
      mode.auto('abcabcabcabcabc12345678901234567890'),
      mode.multi(
        mode.iso8859_1('abcabcabcabcabc'),
        mode.numeric('12345678901234567890'),
      ),
    );
  });

  it('does not combine utf8 with other modes', () => {
    checkSame(
      mode.auto('\u2026 00000000000000000'),
      mode.utf8('\u2026 00000000000000000'),
    );
  });

  it('handles the trivial case of empty input', () => {
    checkSame(mode.auto(''), mode.multi());
  });

  it('does not switch encoding type for no benefit', () => {
    checkSame(mode.auto('abc123'), mode.iso8859_1('abc123'));

    checkSame(mode.auto('123abc'), mode.iso8859_1('123abc'));
  });

  it('can switch mode multiple times if beneficial', () => {
    checkSame(
      mode.auto('1&234567890&1234567890&ABCABCABCABCABCABCabc'),
      mode.multi(
        mode.iso8859_1('1&'),
        mode.numeric('234567890'),
        mode.iso8859_1('&'),
        mode.numeric('1234567890'),
        mode.iso8859_1('&'),
        mode.alphaNumeric('ABCABCABCABCABCABC'),
        mode.iso8859_1('abc'),
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
  const data1 = new Bitmap1D(10);
  const data2 = new Bitmap1D(10);

  encoder1(data1, 1);
  encoder1(data2, 1);
  expect(data2).toMatchBits(data1); // exact repeat

  const data3 = new Bitmap1D(10);
  const data4 = new Bitmap1D(10);
  encoder1(data3, 40);
  encoder2(data4, 40);
  expect(data3).toMatchBits(data4); // version change
}
