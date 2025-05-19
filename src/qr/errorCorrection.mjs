import { mult256PolyLn, rem256Poly } from './galoisPolynomial.mjs';
import { makeUint8Array } from '../util.mjs';

const generators = [[0], [0, 0]];
for (let i = 1; i < 30; ++i) {
  generators.push(mult256PolyLn(generators[i], [0, i]));
}

export const calculateEC = (versionBytes, correction) => {
  const blocks = [[], []];

  let p = 0;
  let size = 0;
  for (const [nBlocks, bytes] of correction._groups) {
    for (let b = 0; b < nBlocks; ++b, p += bytes) {
      const block = versionBytes.slice(p, p + bytes);
      blocks[0].push(block);
      blocks[1].push(rem256Poly(block, generators[correction._ecSize]));
      size += bytes + correction._ecSize;
    }
  }

  const result = makeUint8Array(size);
  size = 0;
  for (const bs of blocks) {
    for (let i = 0, prev; size !== prev; ++i) {
      prev = size;
      for (const block of bs) {
        if (i < block.length) {
          result[size++] = block[i];
        }
      }
    }
  }
  return result;
};
