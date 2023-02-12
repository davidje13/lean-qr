import { mult256PolyLn, rem256Poly } from './galoisPolynomial.mjs';

const generators = [[0], [0, 0]];
for (let i = 1, last = generators[1]; i < 30; ++i) {
  const next = mult256PolyLn(last, [0, i]);
  generators.push(next);
  last = next;
}

export default (versionBytes, o) => {
  const blocks = [[], []];

  let p = 0;
  let size = 0;
  for (const [nBlocks, bytes] of o.g) {
    for (let b = 0; b < nBlocks; ++b, p += bytes) {
      const block = versionBytes.slice(p, p + bytes);
      blocks[0].push(block);
      blocks[1].push(rem256Poly(block, generators[o.s]));
      size += bytes + o.s;
    }
  }

  const result = new Uint8Array(size);
  let offset = 0;
  for (const bs of blocks) {
    for (let i = 0, prev; offset !== prev; ++i) {
      prev = offset;
      for (const block of bs) {
        if (i < block.length) {
          result[offset++] = block[i];
        }
      }
    }
  }
  return result;
};
