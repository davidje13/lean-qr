function getCol(v) {
  if (!Array.isArray(v)) {
    // legacy: assume a little-endian colour (ABGR)
    v = [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, v >>> 24];
  }
  const b = new Uint8Array([...v, 255]);
  return new Uint32Array(b.buffer, 0, 1)[0];
}

export default class Bitmap2D {
  constructor({ size, d }) {
    this.size = size;
    this.d = new Uint8Array(d || size * size);
  }

  get(x, y) {
    return (
      x >= 0 &&
      y >= 0 &&
      x < this.size &&
      y < this.size &&
      !!(this.d[y * this.size + x] & 0b01)
    );
  }

  masked(x, y) {
    return this.d[y * this.size + x] & 0b10;
  }

  set(x, y, value, mask = 1) {
    this.d[y * this.size + x] = (mask * 0b10) | !!value;
  }

  inv(x, y) {
    this.d[y * this.size + x] ^= 1;
  }

  toString({ on = '##', off = '  ', lf = '\n', padX = 4, padY = 4 } = {}) {
    let r = '';
    for (let y = -padY; y < this.size + padY; ++y) {
      for (let x = -padX; x < this.size + padX; ++x) {
        r += this.get(x, y) ? on : off;
      }
      r += lf;
    }
    return r;
  }

  toImageData(
    context,
    { on = 0xff000000, off = 0x00000000, padX = 4, padY = 4 } = {},
  ) {
    const fullX = this.size + padX * 2;
    const fullY = this.size + padY * 2;
    const target = context.createImageData(fullX, fullY);
    const abgr = new Uint32Array(target.data.buffer);
    const cOn = getCol(on);
    const cOff = getCol(off);
    for (let y = 0; y < fullY; ++y) {
      for (let x = 0; x < fullX; ++x) {
        abgr[y * fullX + x] = this.get(x - padX, y - padY) ? cOn : cOff;
      }
    }
    return target;
  }

  toCanvas(canvas, options) {
    const ctx = canvas.getContext('2d');
    const data = this.toImageData(ctx, options);
    canvas.width = data.width;
    canvas.height = data.height;
    ctx.putImageData(data, 0, 0);
  }

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
  }
}
