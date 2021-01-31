export default class Bitmap2D {
  constructor(width, height) {
    if (width instanceof Bitmap2D) {
      this.width = width.width;
      this.height = width.height;
      this.d = new Uint8Array(width.d);
    } else {
      this.width = width;
      this.height = height;
      this.d = new Uint8Array(width * height);
    }
  }

  get(x, y) {
    return !!(this.d[y * this.width + x] & 0b01);
  }

  masked(x, y) {
    return (this.d[y * this.width + x] & 0b10);
  }

  set(x, y, value, mask = 1) {
    this.d[y * this.width + x] = (mask * 0b10) | (!!value);
  }

  xorNoMask(x, y, value) {
    if (value && !this.masked(x, y)) {
      this.d[y * this.width + x] ^= 1;
    }
  }
}
