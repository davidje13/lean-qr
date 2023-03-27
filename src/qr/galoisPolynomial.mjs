import { makeUint8Array } from '../util.mjs';

const LOG = makeUint8Array(512);
LOG[0] = 1;
for (let i = 0, v = 1; i < 255; LOG[++i] = v) {
  LOG[v + 256] = i;
  v *= 2;
  if (v & 256) {
    v ^= 285;
  }
}
const e = (x) => LOG[x % 255]; // assume x is never negative
const ln = (x) => LOG[x + 256];

export const mult256PolyLn = (p1Ln, p2Ln) => {
  const result = makeUint8Array(p1Ln.length + p2Ln.length - 1);
  for (let i = 0; i < p1Ln.length; ++i) {
    for (let j = 0; j < p2Ln.length; ++j) {
      result[i + j] ^= e(p1Ln[i] + p2Ln[j]);
    }
  }
  return result.map(ln);
};

export const rem256Poly = (num, denLn) => {
  const remainder = makeUint8Array(num.length + denLn.length - 1);
  remainder.set(num, 0);
  for (let i = 0; i < num.length; ++i) {
    if (remainder[i]) {
      // assume denLn[0] === 0 (true for all generator polys)
      const shift = ln(remainder[i]); // - denLn[0];
      for (let j = 0; j < denLn.length; ++j) {
        remainder[i + j] ^= e(denLn[j] + shift);
      }
    }
  }
  return remainder.slice(num.length);
};
