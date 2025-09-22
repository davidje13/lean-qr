// http://www.libpng.org/pub/png/spec/iso/index-noobject.html

import { deflateSync } from 'node:zlib';

const PNG_HEADER = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const VOID_BUFFER = Buffer.from([]);
const IHDR = 0x49484452;
const PLTE = 0x504c5445;
const IDAT = 0x49444154;
const IEND = 0x49454e44;
const tRNS = 0x74524e53;

export const toPngBuffer = (
  code,
  {
    on = [0, 0, 0],
    off = [0, 0, 0, 0],
    pad = 4,
    padX = pad,
    padY = pad,
    scale = 1,
  } = {},
) => {
  const w = (code.size + padX * 2) * scale;
  const h = (code.size + padY * 2) * scale;
  const step = (w + 15) >> 3;

  const imageData = Buffer.alloc(h * step);
  for (let y = 0; y < h; ++y) {
    for (let x = 0; x < w; ++x) {
      if (code.get(((x / scale) | 0) - padX, ((y / scale) | 0) - padY)) {
        imageData[y * step + 1 + (x >> 3)] |= 0x80 >> (x & 7);
      }
    }
  }

  const offA = off[3] ?? 255;
  const onA = on[3] ?? 255;
  const trns = (offA & onA) < 255;
  const plte =
    off[0] | off[1] | off[2] | ((on[0] & on[1] & on[2]) < 255) | trns;

  const ihdr = Buffer.alloc(13);
  ihdr.writeInt32BE(w, 0);
  ihdr.writeInt32BE(h, 4);
  ihdr[8] = 1; // bit depth
  ihdr[9] = plte ? 3 : 0; // colour type: indexed / greyscale

  return Buffer.concat([
    PNG_HEADER,
    makeChunk(IHDR, ihdr),
    plte
      ? makeChunk(PLTE, [off[0], off[1], off[2], on[0], on[1], on[2]])
      : VOID_BUFFER,
    trns ? makeChunk(tRNS, [offA, onA]) : VOID_BUFFER,
    makeChunk(IDAT, deflateSync(imageData, { level: 9 })),
    makeChunk(IEND, []),
  ]);
};

export const toPngDataURL = (code, options) =>
  'data:image/png;base64,' + toPngBuffer(code, options).toString('base64');

const makeChunk = (type, data) => {
  const l = data.length;
  const b = Buffer.alloc(12 + l);
  b.writeInt32BE(l, 0);
  b.writeInt32BE(type, 4);
  b.set(data, 8);
  b.writeInt32BE(
    ~b
      .subarray(4, 8 + l)
      .reduce((crc, byte) => CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8), ~0),
    8 + l,
  );
  return b;
};

// http://www.libpng.org/pub/png/spec/iso/index-noobject.html#D-CRCAppendix
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; ++n) {
  let c = n;
  for (let k = 0; k < 8; ++k) {
    c = ((c & 1) * 0xedb88320) ^ (c >>> 1);
  }
  CRC_TABLE[n] = c;
}
