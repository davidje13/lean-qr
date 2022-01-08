import mode from './modes.mjs';
import Bitmap1D from '../../structures/Bitmap1D.mjs';

function expectSameBytes(actualData, expectedData) {
  expect(actualData.bits).toEqual(expectedData.bits);
  const byteCount = Math.ceil(actualData.bits / 8);
  const actualBytes = actualData.bytes.slice(0, byteCount);
  const expectedBytes = expectedData.bytes.slice(0, byteCount);
  expect(actualBytes).toEqual(expectedBytes);
}

function expectRepeatable(encoderFactory) {
  const encoder1 = encoderFactory();
  const encoder2 = encoderFactory();
  const data1 = new Bitmap1D(10);
  const data2 = new Bitmap1D(10);

  encoder1(data1, 1);
  encoder1(data2, 1);
  expectSameBytes(data2, data1); // exact repeat

  const data3 = new Bitmap1D(10);
  const data4 = new Bitmap1D(10);
  encoder1(data3, 40);
  encoder2(data4, 40);
  expectSameBytes(data3, data4); // version change
}

describe('mode.numeric', () => {
  it('stores the identifier and length', () => {
    const data = new Bitmap1D(10);
    mode.numeric('')(data, 1);
    expect(data.bytes[0]).toEqual(0b0001_0000);
    expect(data.bytes[1]).toEqual(0b000000_00);
    expect(data.bits).toEqual(4 + 10);
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
    expect(data.bytes[0]).toEqual(0b0001_0000);
    expect(data.bytes[1]).toEqual(0b001001_00);
    expect(data.bytes[2]).toEqual(0b01111011);
    expect(data.bytes[3]).toEqual(0b00000000);
    expect(data.bytes[4]).toEqual(0b00_111110);
    expect(data.bytes[5]).toEqual(0b0111_0000);
    expect(data.bits).toEqual(4 + 10 + 10 * 3);
  });

  it('encodes 2 final characters in 7 bits', () => {
    const data = new Bitmap1D(10);
    mode.numeric('99')(data, 1);
    expect(data.bytes[0]).toEqual(0b0001_0000);
    expect(data.bytes[1]).toEqual(0b000010_11);
    expect(data.bytes[2]).toEqual(0b00011_000);
    expect(data.bits).toEqual(4 + 10 + 7);
  });

  it('encodes 1 final character in 4 bits', () => {
    const data = new Bitmap1D(10);
    mode.numeric('9')(data, 1);
    expect(data.bytes[0]).toEqual(0b0001_0000);
    expect(data.bytes[1]).toEqual(0b000001_10);
    expect(data.bytes[2]).toEqual(0b01_000000);
    expect(data.bits).toEqual(4 + 10 + 4);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.numeric('1234567890'));
  });
});

describe('mode.alphaNumeric', () => {
  it('stores the identifier and length', () => {
    const data = new Bitmap1D(10);
    mode.alphaNumeric('')(data, 1);
    expect(data.bytes[0]).toEqual(0b0010_0000);
    expect(data.bytes[1]).toEqual(0b00000_000);
    expect(data.bits).toEqual(4 + 9);
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
    expect(data.bytes[0]).toEqual(0b0010_0000);
    expect(data.bytes[1]).toEqual(0b00110_001);
    expect(data.bytes[2]).toEqual(0b11001101);
    expect(data.bytes[3]).toEqual(0b00000000);
    expect(data.bytes[4]).toEqual(0b000_11111);
    expect(data.bytes[5]).toEqual(0b101000_00);
    expect(data.bits).toEqual(4 + 9 + 11 * 3);
  });

  it('encodes 1 final character in 6 bits', () => {
    const data = new Bitmap1D(10);
    mode.alphaNumeric(':')(data, 1);
    expect(data.bytes[0]).toEqual(0b0010_0000);
    expect(data.bytes[1]).toEqual(0b00001_101);
    expect(data.bytes[2]).toEqual(0b100_00000);
    expect(data.bits).toEqual(4 + 9 + 6);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.alphaNumeric('ABC123:'));
  });
});

describe('mode.iso8859_1', () => {
  it('stores the identifier and length', () => {
    const data = new Bitmap1D(10);
    mode.iso8859_1('')(data, 1);
    expect(data.bytes[0]).toEqual(0b0100_0000);
    expect(data.bytes[1]).toEqual(0b0000_0000);
    expect(data.bits).toEqual(4 + 8);
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
    expect(data.bytes[0]).toEqual(0b0100_0000);
    expect(data.bytes[1]).toEqual(0x4_6);
    expect(data.bytes[2]).toEqual(0x1_6);
    expect(data.bytes[3]).toEqual(0x2_a);
    expect(data.bytes[4]).toEqual(0x3_f);
    expect(data.bytes[5]).toEqual(0xf_0);
    expect(data.bits).toEqual(4 + 8 + 8 * 4);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.iso8859_1('abc123'));
  });
});

describe('mode.utf8', () => {
  it('stores the ECI mode, identifier and length', () => {
    const data = new Bitmap1D(10);
    mode.utf8('')(data, 1);
    expect(data.bytes[0]).toEqual(0b0111_0001);
    expect(data.bytes[1]).toEqual(0b1010_0100);
    expect(data.bytes[2]).toEqual(0b0000_0000);
    expect(data.bits).toEqual(4 + 8 + 4 + 8);
  });

  it('encodes values in 8 bit UTF8 encoding', () => {
    const data = new Bitmap1D(10);
    mode.utf8('\u2026')(data, 1);
    expect(data.bytes[0]).toEqual(0b0111_0001);
    expect(data.bytes[1]).toEqual(0b1010_0100);
    expect(data.bytes[2]).toEqual(0b0000_0011);
    expect(data.bytes[3]).toEqual(0xe2);
    expect(data.bytes[4]).toEqual(0x80);
    expect(data.bytes[5]).toEqual(0xa6);
    expect(data.bits).toEqual(4 + 8 + 4 + 8 + 8 * 3);
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.utf8('unicode\u2026'));
  });
});

describe('mode.multi', () => {
  it('appends multiple modes in succession', () => {
    const data = new Bitmap1D(10);
    mode.multi(mode.numeric('0'), mode.numeric('9'))(data, 1);
    expect(data.bytes[0]).toEqual(0b0001_0000);
    expect(data.bytes[1]).toEqual(0b000001_00);
    expect(data.bytes[2]).toEqual(0b00_0001_00);
    expect(data.bytes[3]).toEqual(0b00000001);
    expect(data.bytes[4]).toEqual(0b1001_0000);
    expect(data.bits).toEqual(4 + 10 + 4 + (4 + 10 + 4));
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
  function checkSame(actual, expected, version) {
    const actualData = new Bitmap1D(1000);
    const expectedData = new Bitmap1D(1000);
    actual(actualData, version);
    expected(expectedData, version);

    expectSameBytes(actualData, expectedData);
  }

  it('uses smaller encodings if possible', () => {
    checkSame(mode.auto('123'), mode.numeric('123'), 20);
  });

  it('uses larger encodings if needed', () => {
    checkSame(mode.auto('abc'), mode.iso8859_1('abc'), 20);
  });

  it('uses utf8 if nothing else will do', () => {
    checkSame(mode.auto('unicode\u2026'), mode.utf8('unicode\u2026'), 20);
  });

  it('is restricted to the modes given', () => {
    checkSame(
      mode.auto('123', { modes: [mode.alphaNumeric, mode.iso8859_1] }),
      mode.alphaNumeric('123'),
      20,
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
      20,
    );
  });

  it('does not combine utf8 with other modes', () => {
    checkSame(
      mode.auto('\u2026 00000000000000000'),
      mode.utf8('\u2026 00000000000000000'),
      20,
    );
  });

  it('handles the trivial case of empty input', () => {
    checkSame(mode.auto(''), mode.multi(), 20);
  });

  it('does not switch encoding type for no benefit', () => {
    checkSame(mode.auto('abc123'), mode.iso8859_1('abc123'), 20);

    checkSame(mode.auto('123abc'), mode.iso8859_1('123abc'), 20);
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
      20,
    );
  });

  it('returns a reusable encoding function', () => {
    expectRepeatable(() => mode.auto('ABCDEFGHIJKL1234567890'));
    expectRepeatable(() => mode.auto('needs unicode\u2026'));
  });
});
