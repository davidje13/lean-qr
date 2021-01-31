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
}
