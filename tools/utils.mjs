export function compressNum(v, l = 0) {
  // counterpart to number decompression in readCompressed in corrections.mjs
  if (v < 0) {
    throw new Error('negative value!');
  }
  const r = [];
  const charsetSize = 92; // ASCII # -- ~ (reserve ' ', '!', '"' for control characters)
  for (let i = 0; i < l || (!l && v); ++i) {
    r.push(String.fromCharCode((v % charsetSize) + 35));
    v = Math.floor(v / charsetSize);
  }
  if (v) {
    throw new Error('value out of bounds!');
  }
  return r.reverse().join('');
}

export const quote = (v) =>
  '"' + v.replaceAll('\\', '\\\\').replaceAll('"', '\\"') + '"';
