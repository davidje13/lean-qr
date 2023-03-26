export class Bitmap1D {
  constructor(capacityBytes) {
    this._bytes = new Uint8Array(capacityBytes);
    this._bits = 0;
  }

  push(value, bits) {
    for (let b = bits, r = 8 - (this._bits & 7); b > 0; b -= r, r = 8) {
      this._bytes[this._bits >>> 3] |= (value << r) >>> b;
      this._bits += b < r ? b : r; // min(b, r)
    }
  }
}
