function makeGaloisField(size, modulo) {
  const mod = size - 1;
  const e = new Uint32Array(size);
  const ln = new Uint32Array(size);
  let v = 1;
  for (let i = 0; i < mod; ++i) {
    e[i] = v;
    ln[v] = i;
    v *= 2;
    if (v >= size) {
      v ^= modulo;
    }
  }
  e[mod] = v;
  return {
    // e: (x) => e[((x % mod) + mod) % mod],
    e: (x) => e[x % mod], // assume x is never negative
    ln: (x) => ln[x],
  };
}

export const gf256 = makeGaloisField(256, 285);

export function multPolyLn(gf, p1Ln, p2Ln) {
  const result = new Uint32Array(p1Ln.length + p2Ln.length - 1);
  for (let i = 0; i < p1Ln.length; ++i) {
    for (let j = 0; j < p2Ln.length; ++j) {
      result[i + j] ^= gf.e(p1Ln[i] + p2Ln[j]);
    }
  }
  return result.map(gf.ln);
}

export function remPoly(gf, num, denLn) {
  const remainder = new Uint32Array(num.length + denLn.length - 1);
  remainder.set(num, 0);
  for (let i = 0; i < num.length; ++i) {
    if (!remainder[i]) {
      continue;
    }
    // assume denLn[0] === 0 (true for all generator polys)
    const shift = gf.ln(remainder[i]); // - denLn[0];
    for (let j = 0; j < denLn.length; ++j) {
      remainder[i + j] ^= gf.e(denLn[j] + shift);
    }
  }
  return remainder.slice(num.length);
}
