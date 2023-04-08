import { makeUint8Array } from '../util.mjs';

export const Bitmap1D = () => ({
  _bytes: makeUint8Array(2956), // max capacity of any code
  _bits: 0,
  push(value, bits) {
    for (let b = bits, r = 8 - (this._bits & 7); b > 0; b -= r, r = 8) {
      this._bytes[this._bits >> 3] |= (value << r) >> b;
      this._bits += b < r ? b : r; // min(b, r)
    }
  },
});
