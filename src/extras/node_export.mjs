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
  { on = [0, 0, 0], off = [0, 0, 0, 0], padX = 4, padY = 4, scale = 1 } = {},
) => {
  const s = code.size * scale;
  const w = s + padX * 2 * scale;
  const h = s + padY * 2 * scale;
  const step = 1 + ((w + 7) >> 3);

  const imageData = Buffer.alloc(h * step);
  for (let y = 0; y < s; ++y) {
    const p = (padY * scale + y) * step + 1;
    for (let x = 0; x < s; ++x) {
      if (code.get((x / scale) | 0, (y / scale) | 0)) {
        const q = padX * scale + x;
        imageData[p + (q >> 3)] |= 0x80 >> (q & 7);
      }
    }
  }

  const offA = off[3] ?? 255;
  const onA = on[3] ?? 255;

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 1; // bit depth
  ihdr[9] = 3; // colour type: indexed

  return Buffer.concat([
    PNG_HEADER,
    makeChunk(IHDR, ihdr),
    makeChunk(PLTE, [off[0], off[1], off[2], on[0], on[1], on[2]]),
    (offA & onA) < 255 ? makeChunk(tRNS, [offA, onA]) : VOID_BUFFER,
    makeChunk(IDAT, deflateSync(imageData, { level: 9 })),
    makeChunk(IEND, []),
  ]);
};

export const toPngDataURL = (code, options) =>
  'data:image/png;base64,' + toPngBuffer(code, options).toString('base64');

const makeChunk = (type, data) => {
  const l = data.length;
  const b = Buffer.alloc(12 + l);
  b.writeUInt32BE(l, 0);
  b.writeUInt32BE(type, 4);
  b.set(data, 8);
  b.writeUInt32BE(calcCrc(b.subarray(4, 8 + l)), 8 + l);
  return b;
};

// http://www.libpng.org/pub/png/spec/iso/index-noobject.html#D-CRCAppendix
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; ++n) {
  let c = n;
  for (let k = 0; k < 8; ++k) {
    if (c & 1) {
      c = 0xedb88320 ^ (c >>> 1);
    } else {
      c >>>= 1;
    }
  }
  CRC_TABLE[n] = c;
}

const calcCrc = (data) => {
  let crc = ~0;
  for (let n = 0; n < data.length; ++n) {
    crc = CRC_TABLE[(crc ^ data[n]) & 0xff] ^ (crc >>> 8);
  }
  return ~crc >>> 0;
};
