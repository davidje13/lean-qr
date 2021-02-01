import mode from './modes.mjs';
import Bitmap1D from '../../structures/Bitmap1D.mjs';

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
    expect(data.bytes[3]).toEqual(0x2_A);
    expect(data.bytes[4]).toEqual(0x3_F);
    expect(data.bytes[5]).toEqual(0xF_0);
    expect(data.bits).toEqual(4 + 8 + 8 * 4);
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
    expect(data.bits).toEqual((4 + 10 + 4) + (4 + 10 + 4));
  });

  it('passes version information down', () => {
    const data = new Bitmap1D(10);
    mode.multi(mode.numeric(''))(data, 40);
    expect(data.bits).toEqual(4 + 14);
  });
});
