import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { masks } from './options/masks.mjs';
import { correctionData, minCorrection } from './options/corrections.mjs';
import { calculateEC } from './errorCorrection.mjs';
import { drawFrame, getPath, drawCode, applyMask } from './draw.mjs';
import { scoreCode } from './score.mjs';
import {
  ERROR_NO_DATA,
  ERROR_TOO_MUCH_DATA,
  ERROR_UNENCODABLE,
  makeUint8Array,
} from '../util.mjs';

const baseCache = [];

export const generate = (
  content = fail(ERROR_NO_DATA),
  { minCorrectionLevel: correctionLevel = minCorrection, minVersion = 1 } = {},
) => {
  if (typeof content !== 'string') {
    fail(ERROR_UNENCODABLE);
  }
  content = new TextEncoder().encode(content);
  const data = makeUint8Array(2957); // max capacity of any code + 1 for ease of padding
  data.set([0b01110001, 0b10100100, content.length >> 8]); // set ECI 26 and begin bytes section

  for (let version = minVersion; version < 41; ++version) {
    let base = baseCache[version];
    if (!base) {
      baseCache[version] = base = Bitmap2D(version * 4 + 17);
      drawFrame(base, version);
      base.p = getPath(base);
    }
    const versionCorrection = correctionData(version, base.p.length >> 3);
    const correction = versionCorrection(correctionLevel);
    if (correction._capacityBits >= (3 + (version > 9) + content.length) * 8) {
      let p = version > 9 ? 3 : 2;
      data[p++] = content.length;

      // utf8 content
      data.set(content, p);

      // padding
      for (
        p += content.length - 1;
        p < 2954;
        data.set([0b11101100, 0b00010001], (p += 2))
      );

      const code = Bitmap2D(base.size, base._data);
      drawCode(code, base.p, calculateEC(data, correction));

      // (we could save ~400 more bytes here by hard-coding a specific mask and
      // avoiding the need to call scoreCode, but then we would not be ISO 18004
      // compliant and certain patterns could make things difficult for readers)
      //applyMask(code, masks[0], 0, correctionLevel);
      //return code;

      // pick best mask
      return masks
        .map((m, maskId) => {
          const masked = Bitmap2D(code.size, code._data);
          applyMask(masked, m, maskId, correctionLevel);
          masked.s = scoreCode(masked);
          return masked;
        })
        .sort((a, b) => a.s - b.s)[0];
    }
  }
  fail(ERROR_TOO_MUCH_DATA);
};
