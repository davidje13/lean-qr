export default class Bitmap2D {
  constructor(width, height) {
    if (width instanceof Bitmap2D) {
      this.width = width.width;
      this.height = width.height;
      this.step = width.step;
      this.data = new Uint8Array(width.data);
    } else {
      this.width = width;
      this.height = height;
      this.step = Math.ceil(width / 4);
      this.data = new Uint8Array(this.step * this.height);
    }
  }

  get(x, y) {
    return !!(this.data[y * this.step + (x >> 2)] & (0b01 << ((x & 3) * 2)));
  }

  isMasked(x, y) {
    return this.data[y * this.step + (x >> 2)] & (0b10 << ((x & 3) * 2));
  }

  set(x, y, value, mask = 1) {
    const p = y * this.step + (x >> 2);
    const s = (x & 3) * 2;
    this.data[p] &= ~(0b11 << s);
    this.data[p] |= (((mask * 0b10) | (!!value)) << s);
  }

  xorNoMask(x, y, value) {
    const p = y * this.step + (x >> 2);
    this.data[p] ^= ((!!value) << ((x & 3) * 2)) & ~(this.data[p] >> 1);
  }
}
