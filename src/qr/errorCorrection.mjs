import { mult256PolyLn, rem256Poly } from './galoisPolynomial.mjs';

const generators = [[0], [0, 0]];
for (let i = 1, last = generators[1]; i < 30; ++i) {
  const next = mult256PolyLn(last, [0, i]);
  generators.push(next);
  last = next;
}

function interleave(target, offset, blocks) {
  /* eslint-disable no-param-reassign, no-loop-func */
  let p = offset;
  const lim = Math.max(...blocks.map((block) => block.length));
  for (let i = 0; i < lim; ++i) {
    blocks.forEach((block) => {
      if (i < block.length) {
        target[p++] = block[i];
      }
    });
  }
  /* eslint-enable no-param-reassign, no-loop-func */
  return p;
}

export default function calculateEC(versionData, { groups, ecsize }) {
  const blocks = [];
  const eccs = [];

  let p = 0;
  let size = 0;
  groups.forEach(([nBlocks, bytes]) => {
    for (let b = 0; b < nBlocks; ++b) {
      const block = new Uint8Array(bytes);
      for (let i = 0; i < bytes; ++i) {
        block[i] = versionData.byte(p++);
      }
      blocks.push(block);
      eccs.push(rem256Poly(block, generators[ecsize]));
    }
    size += nBlocks * (bytes + ecsize);
  });

  const result = new Uint8Array(size);
  const pos = interleave(result, 0, blocks);
  interleave(result, pos, eccs);
  return result;
}
