export default class Bitmap1D {
  constructor() {
    this.data = [];
    this.infPad = 0;
    this.infBits = 0;
  }

  get bits() {
    return this.data.length;
  }

  toString() {
    let r = '';
    for (let i = 0; i < this.data.length; i += 8) {
      r += '\n';
      for (let p = 0; p < 8; ++p) {
        r += (this.data[i + p] ? '1' : '0');
      }
    }
    return r.substr(1);
  }

  byte(index) {
    const p = index * 8;
    while (this.data.length < p + 8 && this.infBits) {
      this.addInt(this.infPad, this.infBits);
    }

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

  padToMultiple(divisor, bitFill) {
    const count = Math.ceil(this.data.length / divisor) * divisor - this.data.length;
    for (let i = 0; i < count; ++i) {
      this.data.push(Boolean(bitFill));
    }
  }

  padToInf(padding, paddingBits) {
    this.infPad = padding;
    this.infBits = paddingBits;
  }
}
