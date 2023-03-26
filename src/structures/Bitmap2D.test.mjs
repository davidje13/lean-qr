import { Bitmap2D } from './Bitmap2D.mjs';

describe('Bitmap2D', () => {
  it('begins with all pixels off and unmasked', () => {
    const bmp = new Bitmap2D({ size: 10 });
    expect(bmp.size).toEqual(10);
    expect(bmp.get(0, 0)).toEqual(false);
    expect(bmp.get(9, 9)).toEqual(false);
    expect(bmp._masked(0, 0)).toBeFalsy();
    expect(bmp._masked(9, 9)).toBeFalsy();
  });

  it('stores pixels', () => {
    const bmp = new Bitmap2D({ size: 10 });
    bmp._set(5, 7, true);
    bmp._set(9, 1, false);
    bmp._set(8, 2, true, false);
    bmp._set(4, 3, false, false);
    expect(bmp.get(5, 7)).toEqual(true);
    expect(bmp.get(9, 1)).toEqual(false);
    expect(bmp.get(8, 2)).toEqual(true);
    expect(bmp.get(4, 3)).toEqual(false);
  });

  it('stores mask status pixels', () => {
    const bmp = new Bitmap2D({ size: 10 });
    bmp._set(5, 7, true);
    bmp._set(9, 1, false);
    bmp._set(8, 2, true, false);
    bmp._set(4, 3, false, false);
    expect(bmp._masked(5, 7)).toBeTruthy();
    expect(bmp._masked(9, 1)).toBeTruthy();
    expect(bmp._masked(8, 2)).toBeFalsy();
    expect(bmp._masked(4, 3)).toBeFalsy();
  });

  it('inverts pixels', () => {
    const bmp = new Bitmap2D({ size: 10 });
    bmp._set(5, 7, true);
    bmp._set(9, 1, false);
    bmp._set(8, 2, true, false);
    bmp._set(4, 3, false, false);
    bmp._inv(5, 7);
    bmp._inv(9, 1);
    bmp._inv(8, 2);
    bmp._inv(4, 3);
    expect(bmp.get(5, 7)).toEqual(false);
    expect(bmp.get(9, 1)).toEqual(true);
    expect(bmp.get(8, 2)).toEqual(false);
    expect(bmp.get(4, 3)).toEqual(true);
    expect(bmp._masked(5, 7)).toBeTruthy();
    expect(bmp._masked(9, 1)).toBeTruthy();
    expect(bmp._masked(8, 2)).toBeFalsy();
    expect(bmp._masked(4, 3)).toBeFalsy();
  });

  it('copies an existing bitmap', () => {
    const bmp1 = new Bitmap2D({ size: 3 });
    bmp1._set(0, 1, true);
    const bmp2 = new Bitmap2D(bmp1);

    expect(bmp2.size).toEqual(3);
    expect(bmp2.get(0, 0)).toEqual(false);
    expect(bmp2.get(0, 1)).toEqual(true);

    bmp2._set(1, 0, true);
    expect(bmp2.get(1, 0)).toEqual(true);
    expect(bmp1.get(1, 0)).toEqual(false);

    bmp1._set(1, 1, true);
    expect(bmp2.get(1, 1)).toEqual(false);
  });

  describe('toString', () => {
    it('stringifies the image', () => {
      const str = TEST_IMAGE.toString();
      expect(str).toEqual(
        [
          '                      \n',
          '                      \n',
          '                      \n',
          '                      \n',
          '        ##            \n',
          '        ##            \n',
          '        ##  ##        \n',
          '                      \n',
          '                      \n',
          '                      \n',
          '                      \n',
        ].join(''),
      );
    });

    it('accepts custom settings', () => {
      const str = TEST_IMAGE.toString({
        on: '!',
        off: '_',
        lf: '\r\n',
        padX: 2,
        padY: 1,
      });
      expect(str).toEqual(
        [
          '_______\r\n',
          '__!____\r\n',
          '__!____\r\n',
          '__!_!__\r\n',
          '_______\r\n',
        ].join(''),
      );
    });
  });

  describe('toImageData', () => {
    it('creates image data for the image', () => {
      const imageData = TEST_IMAGE.toImageData(VIRTUAL_CANVAS);
      expect(imageData.width).toEqual(11);
      expect(imageData.height).toEqual(11);

      expect(imageData.data[0]).toEqual(0x00);
      expect(imageData.data[1]).toEqual(0x00);
      expect(imageData.data[2]).toEqual(0x00);
      expect(imageData.data[3]).toEqual(0x00);

      const p = (4 * imageData.width + 4) * 4;
      expect(imageData.data[p + 0]).toEqual(0x00);
      expect(imageData.data[p + 1]).toEqual(0x00);
      expect(imageData.data[p + 2]).toEqual(0x00);
      expect(imageData.data[p + 3]).toEqual(0xff);
    });

    it('accepts custom settings', () => {
      const imageData = TEST_IMAGE.toImageData(VIRTUAL_CANVAS, {
        on: [0x50, 0x60, 0x70, 0x80],
        off: [0x10, 0x20, 0x30, 0x40],
        padX: 2,
        padY: 1,
      });
      expect(imageData.width).toEqual(7);
      expect(imageData.height).toEqual(5);

      expect(imageData.data[0]).toEqual(0x10);
      expect(imageData.data[1]).toEqual(0x20);
      expect(imageData.data[2]).toEqual(0x30);
      expect(imageData.data[3]).toEqual(0x40);

      const p = (1 * imageData.width + 2) * 4;
      expect(imageData.data[p + 0]).toEqual(0x50);
      expect(imageData.data[p + 1]).toEqual(0x60);
      expect(imageData.data[p + 2]).toEqual(0x70);
      expect(imageData.data[p + 3]).toEqual(0x80);
    });

    it('assumes full opacity if not specified', () => {
      const imageData = TEST_IMAGE.toImageData(VIRTUAL_CANVAS, {
        on: [0x50, 0x60, 0x70],
        off: [0x10, 0x20, 0x30],
      });

      expect(imageData.data[0]).toEqual(0x10);
      expect(imageData.data[1]).toEqual(0x20);
      expect(imageData.data[2]).toEqual(0x30);
      expect(imageData.data[3]).toEqual(0xff);

      const p = (4 * imageData.width + 4) * 4;
      expect(imageData.data[p + 0]).toEqual(0x50);
      expect(imageData.data[p + 1]).toEqual(0x60);
      expect(imageData.data[p + 2]).toEqual(0x70);
      expect(imageData.data[p + 3]).toEqual(0xff);
    });
  });

  describe('toCanvas', () => {
    beforeAll(() => {
      assume(globalThis).hasProperty('document');
    });

    it('populates the given canvas with the image content', () => {
      const canvas = document.createElement('canvas');
      TEST_IMAGE.toCanvas(canvas);

      expect(canvas.width).toEqual(11);
      expect(canvas.height).toEqual(11);

      const imageData = canvas
        .getContext('2d')
        .getImageData(0, 0, canvas.width, canvas.height);
      expect(imageData.data[0]).toEqual(0x00);
      expect(imageData.data[1]).toEqual(0x00);
      expect(imageData.data[2]).toEqual(0x00);
      expect(imageData.data[3]).toEqual(0x00);

      const p = (4 * imageData.width + 4) * 4;
      expect(imageData.data[p + 0]).toEqual(0x00);
      expect(imageData.data[p + 1]).toEqual(0x00);
      expect(imageData.data[p + 2]).toEqual(0x00);
      expect(imageData.data[p + 3]).toEqual(0xff);
    });
  });

  describe('toDataURL', () => {
    beforeAll(() => {
      assume(globalThis).hasProperty('document');
    });

    const loadImage = (src) =>
      new Promise((resolve) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img), { once: true });
        img.src = src;
      });

    const getImageData = (img) => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);
      return ctx.getImageData(0, 0, img.width, img.height);
    };

    it('returns a data URL for the image content', async () => {
      const dataUrl = TEST_IMAGE.toDataURL();
      expect(dataUrl).startsWith('data:image/');

      const img = await loadImage(dataUrl);
      expect(img.width).toEqual(11);
      expect(img.height).toEqual(11);

      const imageData = getImageData(img);
      expect(imageData.data[0]).toEqual(0x00);
      expect(imageData.data[1]).toEqual(0x00);
      expect(imageData.data[2]).toEqual(0x00);
      expect(imageData.data[3]).toEqual(0x00);

      const p = (4 * imageData.width + 4) * 4;
      expect(imageData.data[p + 0]).toEqual(0x00);
      expect(imageData.data[p + 1]).toEqual(0x00);
      expect(imageData.data[p + 2]).toEqual(0x00);
      expect(imageData.data[p + 3]).toEqual(0xff);
    });

    it('generates a PNG by default', () => {
      const dataUrl = TEST_IMAGE.toDataURL();
      expect(dataUrl).startsWith('data:image/png;base64,');
    });

    it('scales the image up without blurring', async () => {
      const dataUrl = TEST_IMAGE.toDataURL({ scale: 10 });

      const img = await loadImage(dataUrl);
      expect(img.width).toEqual(110);
      expect(img.height).toEqual(110);

      const imageData = getImageData(img);
      const p = (40 * imageData.width + 40) * 4 + 3;
      expect(imageData.data[p - 4]).toEqual(0x00);
      expect(imageData.data[p + 0]).toEqual(0xff);
      expect(imageData.data[p + 4]).toEqual(0xff);
    });
  });
});

const TEST_IMAGE = new Bitmap2D({ size: 3 });
TEST_IMAGE._set(0, 0, true);
TEST_IMAGE._set(0, 1, true);
TEST_IMAGE._set(0, 2, true);
TEST_IMAGE._set(2, 2, true);

const VIRTUAL_CANVAS = {
  createImageData: (width, height) => {
    return { width, height, data: new Uint8ClampedArray(width * height * 4) };
  },
};
