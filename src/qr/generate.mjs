import { Bitmap1D } from '../structures/Bitmap1D.mjs';
import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { mode, DEFAULT_AUTO_MODES } from './options/modes.mjs';
import { masks } from './options/masks.mjs';
import { correctionData, correction } from './options/corrections.mjs';
import { calculateEC } from './errorCorrection.mjs';
import { drawFrame, getPath, drawCode, applyMask } from './draw.mjs';
import { scoreCode } from './score.mjs';
import {
  fail,
  ERROR_NO_DATA,
  ERROR_INVALID_VERSION_RANGE,
  ERROR_INVALID_ERROR_CORRECTION_RANGE,
  ERROR_TOO_MUCH_DATA,
} from '../util.mjs';

const baseCache = [];

export const generate = (
  modeData = fail(ERROR_NO_DATA),
  {
    minCorrectionLevel = correction.min,
    maxCorrectionLevel = correction.max,
    minVersion = 1,
    maxVersion = 40,
    mask,
    trailer = 0b11101100_00010001,
    ...autoModeConfig
  } = {},
) => {
  if (maxCorrectionLevel < minCorrectionLevel) {
    fail(ERROR_INVALID_ERROR_CORRECTION_RANGE);
  }
  if (maxVersion < minVersion) {
    fail(ERROR_INVALID_VERSION_RANGE);
  }
  if (typeof modeData === 'string') {
    modeData = mode.auto(modeData, autoModeConfig);
  }

  for (
    let version = minVersion, dataLengthBits = 0;
    version <= maxVersion;
    ++version
  ) {
    if (
      correctionData[minCorrectionLevel][version - 1]._capacityBits <
      dataLengthBits
    ) {
      continue;
    }

    const data = Bitmap1D(2956); // max capacity of any code
    modeData(data, version);
    dataLengthBits = data._bits;

    for (let cl = maxCorrectionLevel; cl >= minCorrectionLevel; --cl) {
      const correction = correctionData[cl][version - 1];
      if (correction._capacityBits < dataLengthBits) {
        continue;
      }
      data.push(0b0000, 4);
      data._bits = (data._bits + 7) & ~7; // pad with 0s to the next byte
      while (data._bits < correction._capacityBits) {
        data.push(trailer, 16);
      }

      let base = baseCache[version];
      if (!base) {
        baseCache[version] = base = Bitmap2D(version * 4 + 17);
        drawFrame(base, version);
        base.p = getPath(base);
      }
      const code = base._copy();
      drawCode(code, base.p, calculateEC(data._bytes, correction));

      // pick best mask
      return (masks[mask ?? -1] ? [masks[mask]] : masks)
        .map((m, maskId) => {
          const masked = code._copy();
          applyMask(masked, m, mask ?? maskId, correction._id);
          masked.s = scoreCode(masked);
          return masked;
        })
        .reduce((best, masked) => (masked.s < best.s ? masked : best));
    }
  }
  fail(ERROR_TOO_MUCH_DATA);
};

generate.with =
  (...extraModes) =>
  (modeData, options) =>
    generate(modeData, {
      modes: [...DEFAULT_AUTO_MODES, ...extraModes],
      ...options,
    });
