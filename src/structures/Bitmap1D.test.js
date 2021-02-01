import Bitmap1D from './Bitmap1D.mjs';

describe('Bitmap1D', () => {
  it('stores bytes', () => {
    const bmp = new Bitmap1D(100);
    bmp.push(0xAB, 8);
    expect(bmp.bytes[0]).toEqual(0xAB);
  });

  it('stores bitstreams in big-endian format', () => {
    const bmp = new Bitmap1D(100);
    bmp.push(0xA, 4);
    expect(bmp.bytes[0]).toEqual(0xA0);
  });

  it('combines bitstreams within a byte', () => {
    const bmp = new Bitmap1D(100);
    bmp.push(0x9, 4);
    bmp.push(0xB, 4);
    expect(bmp.bytes[0]).toEqual(0x9B);
  });

  it('stores multiple bytes', () => {
    const bmp = new Bitmap1D(100);
    bmp.push(0x11, 8);
    bmp.push(0xEE, 8);
    expect(bmp.bytes[0]).toEqual(0x11);
    expect(bmp.bytes[1]).toEqual(0xEE);
  });

  it('distributes bits between bytes when adding large values', () => {
    const bmp = new Bitmap1D(100);
    bmp.push(0xABCD, 16);
    expect(bmp.bytes[0]).toEqual(0xAB);
    expect(bmp.bytes[1]).toEqual(0xCD);
  });

  it('distributes bits between bytes when adding on a boundary', () => {
    const bmp = new Bitmap1D(100);
    bmp.push(0x0, 4);
    bmp.push(0x5C, 8);
    expect(bmp.bytes[0]).toEqual(0x05);
    expect(bmp.bytes[1]).toEqual(0xC0);
  });

  it('distributes bits between bytes when adding large values on a boundary', () => {
    const bmp = new Bitmap1D(100);
    bmp.push(0x0, 4);
    bmp.push(0xABCD, 16);
    expect(bmp.bytes[0]).toEqual(0x0A);
    expect(bmp.bytes[1]).toEqual(0xBC);
    expect(bmp.bytes[2]).toEqual(0xD0);
  });

  describe('padByte', () => {
    it('pads to the next byte boundary with 0', () => {
      const bmp = new Bitmap1D(100);
      bmp.push(0x3, 2);
      bmp.padByte();
      bmp.push(0x5B, 8);
      expect(bmp.bytes[0]).toEqual(0xC0);
      expect(bmp.bytes[1]).toEqual(0x5B);
    });

    it('does nothing if at the start', () => {
      const bmp = new Bitmap1D(100);
      bmp.padByte();
      bmp.push(0x5B, 8);
      expect(bmp.bytes[0]).toEqual(0x5B);
    });

    it('does nothing if already on a boundary', () => {
      const bmp = new Bitmap1D(100);
      bmp.push(0xAA, 8);
      bmp.padByte();
      bmp.push(0x5B, 8);
      expect(bmp.bytes[1]).toEqual(0x5B);
    });
  });
});
