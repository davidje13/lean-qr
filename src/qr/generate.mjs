import Bitmap1D from '../structures/Bitmap1D.mjs';
import Bitmap2D from '../structures/Bitmap2D.mjs';
import masks from './options/masks.mjs';
import { data as correctionData, names as correctionNames } from './options/corrections.mjs';
import calculateEC from './errorCorrection.mjs';
import {
  drawFrame,
  getPath,
  drawCode,
  applyMask,
} from './draw.mjs';
import scoreCode from './score.mjs';

const baseCache = new Map();

function getBase(version) {
  if (!baseCache.has(version)) {
    const size = version * 4 + 17;
    const code = new Bitmap2D(size, size);
    drawFrame(code, version);
    const path = getPath(code);
    baseCache.set(version, { code, path });
  }
  const cached = baseCache.get(version);
  return {
    code: new Bitmap2D(cached.code),
    path: cached.path,
  };
}

function pickMask(code, correction) {
  let bestMasked = null;
  let bestMaskScore = Number.POSITIVE_INFINITY;
  masks.forEach((mask) => {
    const masked = new Bitmap2D(code);
    applyMask(masked, mask, correction.id);
    const score = scoreCode(masked);
    if (score < bestMaskScore) {
      bestMasked = masked;
      bestMaskScore = score;
    }
  });
  return bestMasked;
}

export default function generate(modeData, {
  minCorrectionLevel = correctionNames.min,
  maxCorrectionLevel = correctionNames.max,
  minVersion = 1,
  maxVersion = 40,
  mask = null,
} = {}) {
  if (maxCorrectionLevel < minCorrectionLevel) {
    throw new Error('Invalid correction level range');
  }
  if (maxVersion < minVersion) {
    throw new Error('Invalid version range');
  }

  let dataLengthBits = 0;
  for (let version = minVersion; version <= maxVersion; ++version) {
    if (correctionData[minCorrectionLevel].v[version].capBits < dataLengthBits) {
      continue;
    }

    const data = new Bitmap1D(2956); // max capacity of any code
    modeData(data, version);
    dataLengthBits = data.bits;

    for (let cl = maxCorrectionLevel; cl >= minCorrectionLevel; --cl) {
      const correction = correctionData[cl];
      const versionedCorrection = correction.v[version];
      if (versionedCorrection.capBits < dataLengthBits) {
        continue;
      }
      data.addInt(0b0000, 4);
      data.padToByte();
      while (data.bits < versionedCorrection.capBits) {
        data.addInt(0b11101100_00010001, 16);
      }
      const { code, path } = getBase(version);
      drawCode(code, path, calculateEC(data.bytes, versionedCorrection));
      if (mask) {
        applyMask(code, mask, correction.id);
        return code;
      }
      return pickMask(code, correction);
    }
  }
  throw new Error('Too much data');
}
