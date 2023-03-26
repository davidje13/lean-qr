export class Bitmap1D {
  constructor(capacityBytes) {
    this.bytes = new Uint8Array(capacityBytes);
    this.bits = 0;
  }

  push(value, bits) {
    for (let b = bits, r = 8 - (this.bits & 7); b > 0; b -= r, r = 8) {
      this.bytes[this.bits >>> 3] |= (value << r) >>> b;
      this.bits += b < r ? b : r; // min(b, r)
    }
  }
}
