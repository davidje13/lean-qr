import Bitmap1D from '../structures/Bitmap1D.mjs';
import Bitmap2D from '../structures/Bitmap2D.mjs';
import modes from './options/modes.mjs';
import masks from './options/masks.mjs';
import {
  data as correctionData,
  names as correctionNames,
} from './options/corrections.mjs';
import calculateEC from './errorCorrection.mjs';
import { drawFrame, getPath, drawCode, applyMask } from './draw.mjs';
import scoreCode from './score.mjs';

const baseCache = [];
const getBase = (version) => {
  let cached = baseCache[version];
  if (!cached) {
    const c = new Bitmap2D({ size: version * 4 + 17 });
    drawFrame(c, version);
    baseCache[version] = cached = [c, getPath(c)];
  }
  return [new Bitmap2D(cached[0]), cached[1]];
};

export default (
  modeData,
  {
    minCorrectionLevel = correctionNames.min,
    maxCorrectionLevel = correctionNames.max,
    minVersion = 1,
    maxVersion = 40,
    mask = null,
  } = {},
) => {
  if (maxCorrectionLevel < minCorrectionLevel) {
    throw new Error('Invalid correction level range');
  }
  if (maxVersion < minVersion) {
    throw new Error('Invalid version range');
  }
  if (typeof modeData === 'string') {
    modeData = modes.auto(modeData);
  }

  let dataLengthBits = 0;
  for (let version = minVersion; version <= maxVersion; ++version) {
    if (correctionData[minCorrectionLevel].v[version - 1].c < dataLengthBits) {
      continue;
    }

    const data = new Bitmap1D(2956); // max capacity of any code
    modeData(data, version);
    dataLengthBits = data.bits;

    for (let cl = maxCorrectionLevel; cl >= minCorrectionLevel; --cl) {
      const correction = correctionData[cl];
      const versionedCorrection = correction.v[version - 1];
      if (versionedCorrection.c < dataLengthBits) {
        continue;
      }
      data.push(0b0000, 4);
      data.bits = (data.bits + 7) & ~7; // pad with 0s to the next byte
      while (data.bits < versionedCorrection.c) {
        data.push(0b11101100_00010001, 16);
      }
      const [code, path] = getBase(version);
      drawCode(code, path, calculateEC(data.bytes, versionedCorrection));
      if (mask !== null) {
        applyMask(code, masks[mask], mask, correction.id);
        return code;
      }

      // pick best mask
      return masks
        .map((m, maskId) => {
          const masked = new Bitmap2D(code);
          applyMask(masked, m, maskId, correction.id);
          masked.s = scoreCode(masked);
          return masked;
        })
        .reduce((best, masked) => (masked.s < best.s ? masked : best));
    }
  }
  throw new Error('Too much data');
};
