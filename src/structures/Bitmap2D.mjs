import { makeUint8Array } from '../util.mjs';

export const Bitmap2D = (
  size,
  _dataSource = size * size,
  _data = makeUint8Array(_dataSource),
) => ({
  size,
  _data,

  get: (x, y) => x >= 0 && x < size && !!(_data[y * size + x] & 1),

  // begin-exclude-webcomponent
  // begin-exclude-nano
  toString({
    on = '##',
    off = '  ',
    lf = '\n',
    pad = 4,
    padX = pad,
    padY = pad,
  } = {}) {
    let r = '';
    for (let y = -padY; y < size + padY; ++y) {
      for (let x = -padX; x < size + padX; ++x) {
        r += this.get(x, y) ? on : off;
      }
      r += lf;
    }
    return r;
  },
  // end-exclude-nano
  // end-exclude-webcomponent

  toImageData(
    context,
    {
      on = [0, 0, 0],
      off = [0, 0, 0, 0],
      pad = 4,
      padX = pad,
      padY = pad,
    } = {},
  ) {
    const fullX = size + padX * 2;
    const fullY = size + padY * 2;
    const target = context.createImageData(fullX, fullY);
    const abgr = new Uint32Array(target.data.buffer);
    target.data.set([...on, 255]);
    const cOn = abgr[0];
    target.data.set([...off, 255]);
    const cOff = abgr[0];
    for (let y = 0; y < fullY; ++y) {
      for (let x = 0; x < fullX; ++x) {
        abgr[y * fullX + x] = this.get(x - padX, y - padY) ? cOn : cOff;
      }
    }
    return target;
  },

  toCanvas(canvas, options) {
    const ctx = canvas.getContext('2d');
    const data = this.toImageData(ctx, options);
    canvas.width = data.width;
    canvas.height = data.height;
    ctx.putImageData(data, 0, 0);
  },

  // begin-exclude-webcomponent
  // begin-exclude-nano
  toDataURL({ type = 'image/png', scale = 1, ...options } = {}) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = this.toImageData(ctx, options);
    canvas.width = data.width * scale;
    canvas.height = data.height * scale;
    ctx.putImageData(data, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.globalCompositeOperation = 'copy';
    ctx.drawImage(
      canvas,
      0,
      0,
      data.width,
      data.height,
      0,
      0,
      canvas.width,
      canvas.height,
    );
    return canvas.toDataURL(type, 1);
  },
  // end-exclude-nano
  // end-exclude-webcomponent
});
