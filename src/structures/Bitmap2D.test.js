import Bitmap2D from './Bitmap2D.mjs';

describe('Bitmap2D', () => {
  it('begins with all pixels off and unmasked', () => {
    const bmp = new Bitmap2D({ size: 10 });
    expect(bmp.size).toEqual(10);
    expect(bmp.get(0, 0)).toEqual(false);
    expect(bmp.get(9, 9)).toEqual(false);
    expect(bmp.masked(0, 0)).toBeFalsy();
    expect(bmp.masked(9, 9)).toBeFalsy();
  });

  it('stores pixels', () => {
    const bmp = new Bitmap2D({ size: 10 });
    bmp.set(5, 7, true);
    bmp.set(9, 1, false);
    bmp.set(8, 2, true, false);
    bmp.set(4, 3, false, false);
    expect(bmp.get(5, 7)).toEqual(true);
    expect(bmp.get(9, 1)).toEqual(false);
    expect(bmp.get(8, 2)).toEqual(true);
    expect(bmp.get(4, 3)).toEqual(false);
  });

  it('stores mask status pixels', () => {
    const bmp = new Bitmap2D({ size: 10 });
    bmp.set(5, 7, true);
    bmp.set(9, 1, false);
    bmp.set(8, 2, true, false);
    bmp.set(4, 3, false, false);
    expect(bmp.masked(5, 7)).toBeTruthy();
    expect(bmp.masked(9, 1)).toBeTruthy();
    expect(bmp.masked(8, 2)).toBeFalsy();
    expect(bmp.masked(4, 3)).toBeFalsy();
  });

  it('inverts pixels', () => {
    const bmp = new Bitmap2D({ size: 10 });
    bmp.set(5, 7, true);
    bmp.set(9, 1, false);
    bmp.set(8, 2, true, false);
    bmp.set(4, 3, false, false);
    bmp.inv(5, 7);
    bmp.inv(9, 1);
    bmp.inv(8, 2);
    bmp.inv(4, 3);
    expect(bmp.get(5, 7)).toEqual(false);
    expect(bmp.get(9, 1)).toEqual(true);
    expect(bmp.get(8, 2)).toEqual(false);
    expect(bmp.get(4, 3)).toEqual(true);
    expect(bmp.masked(5, 7)).toBeTruthy();
    expect(bmp.masked(9, 1)).toBeTruthy();
    expect(bmp.masked(8, 2)).toBeFalsy();
    expect(bmp.masked(4, 3)).toBeFalsy();
  });

  it('copies an existing bitmap', () => {
    const bmp1 = new Bitmap2D({ size: 3 });
    bmp1.set(0, 1, true);
    const bmp2 = new Bitmap2D(bmp1);

    expect(bmp2.size).toEqual(3);
    expect(bmp2.get(0, 0)).toEqual(false);
    expect(bmp2.get(0, 1)).toEqual(true);

    bmp2.set(1, 0, true);
    expect(bmp2.get(1, 0)).toEqual(true);
    expect(bmp1.get(1, 0)).toEqual(false);

    bmp1.set(1, 1, true);
    expect(bmp2.get(1, 1)).toEqual(false);
  });

  describe('toString', () => {
    it('stringifies the image', () => {
      const bmp = new Bitmap2D({ size: 3 });
      bmp.set(0, 0, true);
      bmp.set(0, 1, true);
      bmp.set(0, 2, true);
      bmp.set(2, 2, true);
      const str = bmp.toString();
      expect(str).toEqual(
        '                      \n' +
        '                      \n' +
        '                      \n' +
        '                      \n' +
        '        ##            \n' +
        '        ##            \n' +
        '        ##  ##        \n' +
        '                      \n' +
        '                      \n' +
        '                      \n' +
        '                      \n',
      );
    });

    it('accepts custom settings', () => {
      const bmp = new Bitmap2D({ size: 3 });
      bmp.set(0, 0, true);
      bmp.set(0, 1, true);
      bmp.set(0, 2, true);
      bmp.set(2, 2, true);
      const str = bmp.toString({
        on: '!',
        off: '_',
        lf: '\r\n',
        padX: 2,
        padY: 1,
      });
      expect(str).toEqual(
        '_______\r\n' +
        '__!____\r\n' +
        '__!____\r\n' +
        '__!_!__\r\n' +
        '_______\r\n',
      );
    });
  });
});
