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
}
