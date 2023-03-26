const UNICODE_MAPPING = new Map();
const decoder = new TextDecoder('sjis');
const b = new Uint8Array(2);

for (const [from, to, shift] of [
  [0x8140, 0x9ffd, 0x8140],
  [0xe040, 0xebc0, 0xc140],
]) {
  for (let c = from; c < to; ++c) {
    b[0] = c >> 8;
    b[1] = c & 0xff;
    const encoded = c - shift;
    const s = decoder.decode(b);
    if (s !== '\uFFFD' && !UNICODE_MAPPING.has(s)) {
      UNICODE_MAPPING.set(s, (encoded >> 8) * 0xc0 + (encoded & 0xff));
    }
  }
}

export const shift_jis = (value) => (data, version) => {
  data.push(0b1000, 4);
  data.push(value.length, 8 + (version > 26) * 2 + (version > 9) * 2);
  for (const c of value) {
    data.push(UNICODE_MAPPING.get(c), 13);
  }
};

shift_jis.test = (c) => UNICODE_MAPPING.has(c);
shift_jis.est = (value, version) =>
  12 + (version > 26) * 2 + (version > 9) * 2 + value.length * 13;
