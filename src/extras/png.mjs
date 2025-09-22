// http://www.libpng.org/pub/png/spec/iso/index-noobject.html

const IHDR = 0x49484452;
const PLTE = 0x504c5445;
const IDAT = 0x49444154;
const IEND = 0x49454e44;
const tRNS = 0x74524e53;

export const toPngBytes = async (
  code,
  { on = [0, 0, 0], off = [0, 0, 0, 0], pad = 4, scale = 1 } = {},
) => {
  const s = (code.size + pad * 2) * scale;
  const step = (s + 15) >> 3;

  const imageData = new Uint8Array(s * step);
  for (let y = 0; y < s; ++y) {
    for (let x = 0; x < s; ++x) {
      if (code.get(((x / scale) | 0) - pad, ((y / scale) | 0) - pad)) {
        imageData[y * step + 1 + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
  }

  const offA = off[3] ?? 255;
  const onA = on[3] ?? 255;
  const trns = (offA & onA) < 255;
  const plte =
    off[0] | off[1] | off[2] | ((on[0] & on[1] & on[2]) < 255) | trns;

  const ihdr = new Uint8Array(13);
  const ihdrDV = new DataView(ihdr.buffer);
  ihdrDV.setInt32(0, s);
  ihdrDV.setInt32(4, s);
  ihdr[8] = 1; // bit depth
  ihdr[9] = plte ? 3 : 0; // colour type: indexed / greyscale

  const parts = [
    [IHDR, ihdr],
    plte && [PLTE, [off[0], off[1], off[2], on[0], on[1], on[2]]],
    trns && [tRNS, [offA, onA]],
    [
      IDAT,
      new Uint8Array(
        await new Response(
          new Blob([imageData])
            .stream()
            .pipeThrough(new CompressionStream('deflate')),
        ).arrayBuffer(), // .bytes() is not supported everywhere yet (mid 2025)
      ),
    ],
    [IEND, []],
  ].filter((v) => v);
  const all = new Uint8Array(
    parts.reduce((s, [, data]) => s + data.length + 12, 8),
  );
  all.set([137, 80, 78, 71, 13, 10, 26, 10]);
  const dv = new DataView(all.buffer);
  let p = 4;
  for (const [type, data] of parts) {
    const l = data.length;
    dv.setInt32((p += 4), l);
    dv.setInt32((p += 4), type);
    all.set(data, (p += 4));
    dv.setInt32(
      p + l,
      ~all
        .subarray(p - 4, (p += l))
        .reduce(
          (crc, byte) => CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8),
          ~0,
        ),
    );
  }

  return all;
};

export const toPngDataURL = async (code, options) =>
  'data:image/png;base64,' + b64(await toPngBytes(code, options));

// Uint8Array.toBase64 is not widely supported yet (mid 2025) - include a fallback
const b64 = (v) =>
  v.toBase64?.() ?? btoa([...v].map((c) => String.fromCodePoint(c)).join(''));

// http://www.libpng.org/pub/png/spec/iso/index-noobject.html#D-CRCAppendix
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; ++n) {
  let c = n;
  for (let k = 0; k < 8; ++k) {
    c = ((c & 1) * 0xedb88320) ^ (c >>> 1);
  }
  CRC_TABLE[n] = c;
}
