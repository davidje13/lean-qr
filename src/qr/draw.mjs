const remBinPoly = (num, den, denBits) => {
  let remainder = num << (denBits - 1);
  for (let i = 0x8000000; i; i >>= 1) {
    if (remainder & i) {
      remainder ^= den * (i >> (denBits - 1));
    }
  }
  return remainder;
};

export const drawFrame = ({ size, _data, _set }, version) => {
  const drawRect = (x1, y1, w, h, value) => {
    for (; h-- > 0; ) {
      const p = (y1 + h) * size + x1;
      _data.fill(value, p, p + w);
    }
  };

  const drawPlacement = (x, y) => {
    drawRect(x - 3, y - 3, 7, 7, 3);
    drawRect(x - 2, y - 2, 5, 5, 2);
    drawRect(x - 1, y - 1, 3, 3, 3);
  };

  const drawAlignment = (x, y) => {
    drawRect(x - 2, y - 2, 5, 5, 3);
    drawRect(x - 1, y - 1, 3, 3, 2);
    _set(x, y, 3);
  };

  drawRect(7, 0, 2, 9, 2);
  drawRect(size - 8, 0, 8, 9, 2);
  for (let i = 0; i < size; ++i) {
    _set(i, 6, 3 ^ (i & 1));
  }
  drawPlacement(3, 3);
  drawPlacement(size - 4, 3);
  if (version > 1) {
    const numAlignmentM = ((version / 7) | 0) + 1;
    // alignment boxes must always be positioned on even pixels
    // and are spaced evenly from the bottom right (except top and left which are always 6)
    // the 0.75 (1-0.25) avoids a quirk in the spec for version 32
    const stepAlignment = (((size - 13) / numAlignmentM / 2 + 0.75) | 0) * 2;
    for (let i = 0; i < numAlignmentM; ++i) {
      const p = size - 7 - i * stepAlignment;
      if (i) {
        drawAlignment(p, 6);
      }
      for (let j = 0; j < numAlignmentM; ++j) {
        drawAlignment(p, size - 7 - j * stepAlignment);
      }
    }
  }
  if (version > 6) {
    for (
      let dat = (version << 12) | remBinPoly(version, 0b1111100100101, 13),
        j = 0;
      j < 6;
      ++j
    ) {
      for (let i = 12; i-- > 9; dat >>= 1) {
        _set(size - i, j, 2 | (dat & 1));
      }
    }
  }
  for (let y = 0; y < size; ++y) {
    for (let x = y; x < size; ++x) {
      _data[x * size + y] = _data[y * size + x];
    }
  }
  _set(8, size - 8, 3);
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
      if (_data[p + 1] < 2) {
        result.push(p + 1);
      }
      if (_data[p] < 2) {
        result.push(p);
      }
    }
    dirY *= -1;
  }
  return result;
};

export const drawCode = ({ _data }, path, data) =>
  path.forEach(
    (p, bit) => (_data[p] = (data[bit >> 3] >> (7 - (bit & 7))) & 1),
  );

export const applyMask = ({ size, _data, _set }, mask, maskId, ecLevel) => {
  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
      const p = y * size + x;
      _data[p] ^= mask(x, y) & ((_data[p] >> 1) ^ 1);
    }
  }
  const info = ((ecLevel ^ 1) << 3) | maskId;
  let pattern =
    0b101010000010010 ^ ((info << 10) | remBinPoly(info, 0b10100110111, 11));
  for (let i = 8; i-- > 0; pattern >>= 1) {
    _set(8, (i > 1 ? 7 : 8) - i, pattern);
    _set(size - 8 + i, 8, pattern);
  }
  for (let i = 7; i-- > 0; pattern >>= 1) {
    _set(i > 5 ? 7 : i, 8, pattern);
    _set(8, size - i - 1, pattern);
  }
};
