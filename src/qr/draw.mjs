const remBinPoly = (num, den, denBitsMinusOne) => {
  num <<= denBitsMinusOne;
  for (let i = 0x8000000; (i >>= 1); ) {
    if (num & i) {
      num ^= den * (i >> denBitsMinusOne);
    }
  }
  return num;
};

export const drawFrame = ({ size, _data }, version) => {
  const drawRect = (p, w, h, value) => {
    for (; h-- > 0; p += size) {
      _data.fill(value, p, p + w);
    }
  };

  const drawAlignment = (x, y, diameter) => {
    for (let n = 0; n++ < 3; diameter -= 2) {
      drawRect(
        y * size + x - (diameter >> 1) * (size + 1),
        diameter,
        diameter,
        n | 2,
      );
    }
  };

  const numAlignmentM = ((version / 7) | 0) + 1;
  // alignment boxes must always be positioned on even pixels
  // and are spaced evenly from the bottom right (except top and left which are always 6)
  // the 0.75 (1-0.25) avoids a quirk in the spec for version 32
  const stepAlignment = (((size - 13) / numAlignmentM / 2 + 0.75) | 0) * 2;
  if (version > 1) {
    for (let i = size - 7; i > 8; i -= stepAlignment) {
      for (let j = i; j > 8; j -= stepAlignment) {
        drawAlignment(i, j, 5);
      }
      if (i < size - 7) {
        drawAlignment(i, 6, 5);
      }
    }
  }
  if (version > 6) {
    for (
      let dat = (version << 12) | remBinPoly(version, 0b1111100100101, 12),
        j = 0;
      j < 6;
      ++j
    ) {
      for (let i = 12; i-- > 9; dat >>= 1) {
        _data[j * size + size - i] = 2 | (dat & 1);
      }
    }
  }
  drawRect(7, 2, 9, 2);
  drawRect(size - 8, 8, 9, 2);
  for (let i = 0; i < size; ++i) {
    _data[6 * size + i] = 3 ^ (i & 1);
  }
  drawAlignment(3, 3, 7);
  drawAlignment(size - 4, 3, 7);
  for (let j = 0; j < size; ++j) {
    for (let i = j; i < size; ++i) {
      _data[i * size + j] = _data[j * size + i];
    }
  }
  _data[(size - 8) * size + 8] = 3;
};

export const getPath = ({ size, _data }) => {
  const result = [];
  for (let xB = size - 2, y = size, dirY = -1; xB >= 0; xB -= 2) {
    if (xB === 5) {
      // special case: skip vertical timing pattern line
      xB = 4;
    }
    while (((y += dirY), y !== -1 && y !== size)) {
      const p = y * size + xB;
      if (!_data[p + 1]) {
        result.push(p + 1);
      }
      if (!_data[p]) {
        result.push(p);
      }
    }
    dirY *= -1;
  }
  return result;
};

export const drawCode = ({ _data }, path, data) =>
  path.forEach((p, bit) => (_data[p] = (data[bit >> 3] >> (~bit & 7)) & 1));

export const applyMask = ({ size, _data }, mask, maskId, ecLevel) => {
  for (let j = 0; j < size; ++j) {
    for (let i = 0; i < size; ++i) {
      const p = j * size + i;
      _data[p] ^= mask(i, j) & ((_data[p] >> 1) ^ 1);
    }
  }
  const info = ((ecLevel ^ 1) << 3) | maskId;
  let pattern =
    0b101010000010010 ^ ((info << 10) | remBinPoly(info, 0b10100110111, 10));
  for (let i = 0; i++ < 8; pattern >>= 1) {
    _data[(i - (i < 7)) * size + 8] = pattern;
    _data[9 * size - i] = pattern;
  }
  for (let i = 8; --i, pattern; pattern >>= 1) {
    _data[8 * size + i - (i < 7)] = pattern;
    _data[(size - i) * size + 8] = pattern;
  }
};
