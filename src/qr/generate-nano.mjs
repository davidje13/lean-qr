import { Bitmap1D } from '../structures/Bitmap1D.mjs';
import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { masks } from './options/masks.mjs';
import { correctionData, minCorrection } from './options/corrections.mjs';
import { calculateEC } from './errorCorrection.mjs';
import { drawFrame, getPath, drawCode, applyMask } from './draw.mjs';
import { scoreCode } from './score.mjs';

const baseCache = [];

export const generate = (
  modeData = '',
  { minCorrectionLevel = minCorrection, minVersion = 1 } = {},
) => {
  if (typeof modeData === 'string') {
    const enc = new TextEncoder().encode(modeData);
    modeData = (data, version) => {
      // set ECI 26 and begin bytes section
      data.push((0b0111 << 12) | (26 << 4) | 0b0100, 16);
      data.push(enc.length, version > 9 ? 16 : 8);
      enc.forEach((b) => data.push(b, 8));
    };
  }

  for (let version = minVersion, dataLengthBits = 0; version <= 40; ++version) {
    let base = baseCache[version];
    if (!base) {
      baseCache[version] = base = Bitmap2D(version * 4 + 17);
      drawFrame(base, version);
      base.p = getPath(base);
    }
    const versionCorrection = correctionData(version, base.p.length >> 3);
    const correction = versionCorrection(minCorrectionLevel);
    if (correction._capacityBits < dataLengthBits) {
      continue;
    }

    const data = Bitmap1D();
    modeData(data, version);
    dataLengthBits = data._bits;

    if (correction._capacityBits < dataLengthBits) {
      continue;
    }
    data.push(0b0000, 4);
    data._bits = (data._bits + 7) & ~7; // pad with 0s to the next byte
    while (data._bits < correction._capacityBits) {
      data.push(0b11101100_00010001, 16);
    }

    const code = Bitmap2D(base.size, base._data);
    drawCode(code, base.p, calculateEC(data._bytes, correction));

    // (we could save ~400 more bytes here by hard-coding a specific mask and
    // avoiding the need to call scoreCode, but then we would not be ISO 18004
    // compliant and certain patterns could make things difficult for readers)
    //applyMask(code, masks[0], 0, minCorrection);
    //return code;

    // pick best mask
    return masks
      .map((m, maskId) => {
        const masked = Bitmap2D(code.size, code._data);
        applyMask(masked, m, maskId, minCorrectionLevel);
        masked.s = scoreCode(masked);
        return masked;
      })
      .reduce((best, masked) => (masked.s < best.s ? masked : best));
  }
  throw new Error('too much data');
};
