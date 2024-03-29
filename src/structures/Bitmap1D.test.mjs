import { Bitmap1D } from './Bitmap1D.mjs';

describe('Bitmap1D', () => {
  it('stores bytes', () => {
    const bmp = Bitmap1D();
    bmp.push(0xab, 8);
    expect(bmp._bytes[0]).toEqual(0xab);
  });

  it('stores bitstreams in big-endian format', () => {
    const bmp = Bitmap1D();
    bmp.push(0xa, 4);
    expect(bmp._bytes[0]).toEqual(0xa0);
  });

  it('combines bitstreams within a byte', () => {
    const bmp = Bitmap1D();
    bmp.push(0x9, 4);
    bmp.push(0xb, 4);
    expect(bmp._bytes[0]).toEqual(0x9b);
  });

  it('stores multiple bytes', () => {
    const bmp = Bitmap1D();
    bmp.push(0x11, 8);
    bmp.push(0xee, 8);
    expect(bmp._bytes[0]).toEqual(0x11);
    expect(bmp._bytes[1]).toEqual(0xee);
  });

  it('distributes bits between bytes when adding large values', () => {
    const bmp = Bitmap1D();
    bmp.push(0xabcd, 16);
    expect(bmp._bytes[0]).toEqual(0xab);
    expect(bmp._bytes[1]).toEqual(0xcd);
  });

  it('distributes bits between bytes when adding on a boundary', () => {
    const bmp = Bitmap1D();
    bmp.push(0x0, 4);
    bmp.push(0x5c, 8);
    expect(bmp._bytes[0]).toEqual(0x05);
    expect(bmp._bytes[1]).toEqual(0xc0);
  });

  it('distributes bits between bytes when adding large values on a boundary', () => {
    const bmp = Bitmap1D();
    bmp.push(0x0, 4);
    bmp.push(0xabcd, 16);
    expect(bmp._bytes[0]).toEqual(0x0a);
    expect(bmp._bytes[1]).toEqual(0xbc);
    expect(bmp._bytes[2]).toEqual(0xd0);
  });
});
