import { Bitmap1D } from '../structures/Bitmap1D.mjs';
import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { mode, DEFAULT_AUTO_MODES } from './options/modes.mjs';
import { masks } from './options/masks.mjs';
import {
  correctionData,
  minCorrection,
  maxCorrection,
} from './options/corrections.mjs';
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
    minCorrectionLevel = minCorrection,
    maxCorrectionLevel = maxCorrection,
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
    let base = baseCache[version];
    if (!base) {
      baseCache[version] = base = Bitmap2D(version * 4 + 17);
      drawFrame(base, version);
      base.p = getPath(base);
    }
    const versionCorrection = correctionData(version, base.p.length >> 3);
    if (
      versionCorrection(minCorrectionLevel)._capacityBytes * 8 <
      dataLengthBits
    ) {
      continue;
    }

    const data = Bitmap1D();
    modeData(data, version);
    dataLengthBits = data._bits;

    for (let cl = maxCorrectionLevel; cl >= minCorrectionLevel; --cl) {
      const correction = versionCorrection(cl);
      if (correction._capacityBytes * 8 < dataLengthBits) {
        continue;
      }
      data._bits = (dataLengthBits + 11) & ~7; // pad with 1 nibble, then to the next byte
      while (data._bits < correction._capacityBytes * 8) {
        data.push(trailer, 16);
      }

      const code = Bitmap2D(base.size, base._data);
      drawCode(code, base.p, calculateEC(data._bytes, correction));

      // pick best mask
      return (masks[mask ?? -1] ? [masks[mask]] : masks)
        .map((m, maskId) => {
          const masked = Bitmap2D(code.size, code._data);
          applyMask(masked, m, mask ?? maskId, cl);
          masked.s = scoreCode(masked);
          return masked;
        })
        .reduce((best, masked) => (masked.s < best.s ? masked : best));
    }
  }
  fail(ERROR_TOO_MUCH_DATA);
};

// begin-exclude-webcomponent
generate.with =
  (...extraModes) =>
  (modeData, options) =>
    generate(modeData, {
      modes: [...DEFAULT_AUTO_MODES, ...extraModes],
      ...options,
    });
// end-exclude-webcomponent
