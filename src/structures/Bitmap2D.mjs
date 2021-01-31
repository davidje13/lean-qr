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
    return Boolean(this.data[y * this.step + (x >> 2)] & (0b01 << ((x & 3) * 2)));
  }

  isMasked(x, y) {
    return Boolean(this.data[y * this.step + (x >> 2)] & (0b10 << ((x & 3) * 2)));
  }

  setAsMask(x, y, value = true) {
    const p = y * this.step + (x >> 2);
    const s = (x & 3) * 2;
    this.data[p] &= ~(0b11 << s);
    this.data[p] |= ((0b10 | Boolean(value)) << s);
  }

  setNoMask(x, y, value = true) {
    const p = y * this.step + (x >> 2);
    const s = (x & 3) * 2;
    this.data[p] &= ~(0b11 << s);
    this.data[p] |= (Boolean(value) << s);
  }

  xor(x, y, value = true) {
    this.data[y * this.step + (x >> 2)] ^= (Boolean(value) << ((x & 3) * 2));
  }

  xorIfUnmasked(x, y, value = true) {
    const p = y * this.step + (x >> 2);
    this.data[p] ^= (Boolean(value) << ((x & 3) * 2)) & ~(this.data[p] >> 1);
  }
}
