import { Bitmap1D } from '../structures/Bitmap1D.mjs';
import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { mode, DEFAULT_AUTO_MODES } from './options/modes.mjs';
import { masks } from './options/masks.mjs';
import { data as correctionData, correction } from './options/corrections.mjs';
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

      if (!baseCache[version]) {
        const c = new Bitmap2D({ size: version * 4 + 17 });
        drawFrame(c, version);
        c.p = getPath(c);
        baseCache[version] = c;
      }
      const code = new Bitmap2D(baseCache[version]);
      drawCode(
        code,
        baseCache[version].p,
        calculateEC(data.bytes, versionedCorrection),
      );

      // pick best mask
      return (masks[mask ?? -1] ? [masks[mask]] : masks)
        .map((m, maskId) => {
          const masked = new Bitmap2D(code);
          applyMask(masked, m, mask ?? maskId, correction.id);
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
