export default class Bitmap1D {
  constructor() {
    this.data = [];
  }

  get bits() {
    return this.data.length;
  }

  byte(index) {
    const p = index * 8;
    let v = 0;
    for (let i = 0; i < 8; ++i) {
      v = (v << 1) | this.data[p + i];
    }
    return v;
  }

  addInt(value, bits) {
    for (let mask = 1 << (bits - 1); mask; mask >>>= 1) {
      this.data.push(Boolean(value & mask));
    }
  }

  padToByte() {
    for (let i = (this.data.length + 7) & 7; i < 7; ++i) {
      this.data.push(false);
    }
  }
}
