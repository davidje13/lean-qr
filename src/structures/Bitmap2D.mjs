function getCol(v) {
  if (!Array.isArray(v)) {
    // legacy: assume a little-endian colour (ABGR)
    /* eslint-disable-next-line no-param-reassign */
    v = [
      v & 255,
      (v >>> 8) & 255,
      (v >>> 16) & 255,
      (v >>> 24),
    ];
  }
  const b = new Uint8Array([...v, 255]);
  return new Uint32Array(b.buffer, 0, 1)[0];
}

export default class Bitmap2D {
  constructor({ size, d }) {
    this.size = size;
    this.d = new Uint8Array(d || (size * size));
  }

  get(x, y) {
    return !!(this.d[y * this.size + x] & 0b01);
  }

  masked(x, y) {
    return (this.d[y * this.size + x] & 0b10);
  }

  set(x, y, value, mask = 1) {
    this.d[y * this.size + x] = (mask * 0b10) | (!!value);
  }

  inv(x, y) {
    this.d[y * this.size + x] ^= 1;
  }

  toString({
    on = '##',
    off = '  ',
    lf = '\n',
    padX = 4,
    padY = 4,
  } = {}) {
    const tbPad = (off.repeat(this.size + padX * 2) + lf).repeat(padY);
    const lrPad = off.repeat(padX);
    let r = tbPad;
    for (let y = 0; y < this.size; ++y) {
      r += lrPad;
      for (let x = 0; x < this.size; ++x) {
        r += this.get(x, y) ? on : off;
      }
      r += lrPad + lf;
    }
    return r + tbPad;
  }

  toImageData(context, {
    on = 0xFF000000,
    off = 0x00000000,
  } = {}) {
    const target = context.createImageData(this.size, this.size);
    const abgr = new Uint32Array(target.data.buffer);
    const cOn = getCol(on);
    const cOff = getCol(off);
    abgr.fill(cOff);
    for (let p = 0; p < this.size * this.size; ++p) {
      abgr[p] = (this.d[p] & 0b01) ? cOn : cOff;
    }
    return target;
  }

  toCanvas(canvas, {
    padX = 4,
    padY = 4,
    ...options
  } = {}) {
    /* eslint-disable no-param-reassign */
    canvas.width = this.size + padX * 2;
    canvas.height = this.size + padY * 2;
    /* eslint-enable no-param-reassign */
    const ctx = canvas.getContext('2d');
    const data = this.toImageData(ctx, options);
    ctx.putImageData(data, padX, padY);
  }
}
