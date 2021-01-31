import Bitmap1D from '../structures/Bitmap1D.mjs';
import Bitmap2D from '../structures/Bitmap2D.mjs';
import masks from './options/masks.mjs';
import corrections from './options/corrections.mjs';
import calculateEC from './errorCorrection.mjs';
import {
  drawFrame,
  getPath,
  drawCode,
  applyMask,
} from './draw.mjs';
import scoreCode from './score.mjs';

const EncodeEnd = (data) => data.addInt(0b0000, 4);

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

export default function generate(modeData, {
  correctionLevel = corrections.L,
  minVersion = 1,
  maxVersion = 40,
  mask = null,
} = {}) {
  for (let version = minVersion; version <= maxVersion; ++version) {
    const data = new Bitmap1D();
    modeData(data, version);
    const endOfUsefulData = data.bits;
    EncodeEnd(data);
    data.padToMultiple(8, false);
    data.padToInf(0b11101100_00010001, 16);

    const versionedCorrection = correctionLevel.versions[version - 1];
    if (versionedCorrection.capacity * 8 < endOfUsefulData) {
      continue;
    }
    const ec = calculateEC(data, versionedCorrection);
    const { code, path } = getBase(version);
    drawCode(code, path, ec);
    if (mask) {
      applyMask(code, mask, correctionLevel.id);
      return code;
    }
    let bestMasked = null;
    let bestMaskScore = Number.POSITIVE_INFINITY;
    masks.forEach((m) => {
      const masked = new Bitmap2D(code);
      applyMask(masked, m, correctionLevel.id);
      const score = scoreCode(masked);
      if (score < bestMaskScore) {
        bestMasked = masked;
        bestMaskScore = score;
      }
    });
    return bestMasked;
  }
  throw new Error('Insufficient storage space for data');
}
