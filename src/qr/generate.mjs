import { Bitmap1D } from '../structures/Bitmap1D.mjs';
import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { mode, DEFAULT_AUTO_MODES } from './options/modes.mjs';
import { masks } from './options/masks.mjs';
import { correctionData, correction } from './options/corrections.mjs';
import { calculateEC } from './errorCorrection.mjs';
import { drawFrame, getPath, drawCode, applyMask } from './draw.mjs';
import { scoreCode } from './score.mjs';

const baseCache = [];

export const generate = (
  modeData,
  {
    minCorrectionLevel = correction.min,
    maxCorrectionLevel = correction.max,
    minVersion = 1,
    maxVersion = 40,
    mask,
    ...autoModeConfig
  } = {},
) => {
  if (maxCorrectionLevel < minCorrectionLevel) {
    throw new Error('Invalid correction level range');
  }
  if (maxVersion < minVersion) {
    throw new Error('Invalid version range');
  }
  if (typeof modeData === 'string') {
    modeData = mode.auto(modeData, autoModeConfig);
  }

  for (
    let version = minVersion, dataLengthBits = 0;
    version <= maxVersion;
    ++version
  ) {
    if (correctionData[minCorrectionLevel][version - 1].c < dataLengthBits) {
      continue;
    }

    const data = new Bitmap1D(2956); // max capacity of any code
    modeData(data, version);
    dataLengthBits = data._bits;

    for (let cl = maxCorrectionLevel; cl >= minCorrectionLevel; --cl) {
      const correction = correctionData[cl][version - 1];
      if (correction.c < dataLengthBits) {
        continue;
      }
      data.push(0b0000, 4);
      data._bits = (data._bits + 7) & ~7; // pad with 0s to the next byte
      while (data._bits < correction.c) {
        data.push(0b11101100_00010001, 16);
      }

      let base = baseCache[version];
      if (!base) {
        baseCache[version] = base = new Bitmap2D({ size: version * 4 + 17 });
        drawFrame(base, version);
        base.p = getPath(base);
      }
      const code = new Bitmap2D(base);
      drawCode(code, base.p, calculateEC(data._bytes, correction));

      // pick best mask
      return (masks[mask ?? -1] ? [masks[mask]] : masks)
        .map((m, maskId) => {
          const masked = new Bitmap2D(code);
          applyMask(masked, m, mask ?? maskId, correction.i);
          masked.s = scoreCode(masked);
          return masked;
        })
        .reduce((best, masked) => (masked.s < best.s ? masked : best));
    }
  }
  throw new Error('Too much data');
};

generate.with =
  (...extraModes) =>
  (modeData, options) =>
    generate(modeData, {
      modes: [...DEFAULT_AUTO_MODES, ...extraModes],
      ...options,
    });
