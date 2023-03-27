const remBinPoly = (num, den, denBits) => {
  let remainder = num << (denBits - 1);
  for (let i = 0x8000000; i; i >>>= 1) {
    if (remainder & i) {
      remainder ^= den * (i >>> (denBits - 1));
    }
  }
  return remainder;
};

export const drawFrame = (code, version) => {
  const drawRect = (x1, y1, w, h, value) => {
    for (; h-- > 0; ) {
      for (let x = w; x-- > 0; ) {
        code._set(x1 + x, y1 + h, value);
      }
    }
  };

  const drawPlacement = (x, y) => {
    drawRect(x - 3, y - 3, 7, 7, 1);
    drawRect(x - 2, y - 2, 5, 5, 0);
    drawRect(x - 1, y - 1, 3, 3, 1);
  };

  const drawAlignment = (x, y) => {
    drawRect(x - 2, y - 2, 5, 5, 1);
    drawRect(x - 1, y - 1, 3, 3, 0);
    code._set(x, y, 1);
  };

  const size = version * 4 + 17;
  drawRect(7, 0, 2, 9, 0);
  drawRect(size - 8, 0, 8, 9, 0);
  for (let i = 0; i < size; ++i) {
    code._set(i, 6, !(i & 1));
  }
  drawPlacement(3, 3);
  drawPlacement(size - 4, 3);
  if (version > 1) {
    const numAlignmentM = ((version / 7) | 0) + 1;
    // alignment boxes must always be positioned on even pixels
    // and are spaced evenly from the bottom right (except top and left which are always 6)
    // the 0.75 (1-0.25) avoids a quirk in the spec for version 32
    const stepAlignment = (((size - 13) / numAlignmentM / 2 + 0.75) | 0) * 2;
    const positions = [];
    for (let i = 0; i < numAlignmentM; ++i) {
      positions.push(size - 7 - i * stepAlignment);
      if (i) {
        drawAlignment(positions[i], 6);
      }
    }
    for (let i = 0; i < numAlignmentM; ++i) {
      for (let j = 0; j < numAlignmentM; ++j) {
        drawAlignment(positions[i], positions[j]);
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
      for (let i = 12; i-- > 9; dat >>>= 1) {
        code._set(size - i, j, dat & 1);
      }
    }
  }
  for (let y = 0; y < size; ++y) {
    for (let x = y; x < size; ++x) {
      code._data[x * size + y] = code._data[y * size + x];
    }
  }
  code._set(8, size - 8, 1);
};

export const getPath = (code) => {
  const s = code.size;
  const result = [];
  for (let xB = s - 2, y = s, dirY = -1; xB >= 0; xB -= 2) {
    if (xB === 5) {
      // special case: skip vertical timing pattern line
      xB = 4;
    }
    while (((y += dirY), y !== -1 && y !== s)) {
      if (!code._masked(xB + 1, y)) {
        result.push([xB + 1, y]);
      }
      if (!code._masked(xB, y)) {
        result.push([xB, y]);
      }
    }
    dirY *= -1;
  }
  return result;
};

export const drawCode = (code, path, data) => {
  path.forEach(([x, y], bit) =>
    code._set(x, y, (data[bit >> 3] << (bit & 7)) & 0x80, 0),
  );
};

export const applyMask = (code, mask, maskId, ecId) => {
  const s = code.size;
  for (let y = 0; y < s; ++y) {
    for (let x = 0; x < s; ++x) {
      if (mask(x, y) && !code._masked(x, y)) {
        code._inv(x, y);
      }
    }
  }
  const info = (ecId << 3) | maskId;
  let pattern =
    0b101010000010010 ^ ((info << 10) | remBinPoly(info, 0b10100110111, 11));
  for (let i = 8; i-- > 0; pattern >>= 1) {
    code._set(8, (i > 1 ? 7 : 8) - i, pattern & 1);
    code._set(s - 8 + i, 8, pattern & 1);
  }
  for (let i = 7; i-- > 0; pattern >>= 1) {
    code._set(i > 5 ? 7 : i, 8, pattern & 1);
    code._set(8, s - i - 1, pattern & 1);
  }
};
