const remBinPoly = (num, den, denBits) => {
  let remainder = num << (denBits - 1);
  for (let i = 0x40000000; i; i >>>= 1) {
    if (remainder & i) {
      remainder ^= den * (i >>> (denBits - 1));
    }
  }
  return remainder;
};

const drawRect = (code, x1, y1, x2, y2, value) => {
  for (let y = y1; y < y2; ++y) {
    for (let x = x1; x < x2; ++x) {
      code.set(x, y, value);
    }
  }
};

const drawPlacement = (code, x, y) => {
  drawRect(code, x - 3, y - 3, x + 4, y + 4, 1);
  drawRect(code, x - 2, y - 2, x + 3, y + 3, 0);
  drawRect(code, x - 1, y - 1, x + 2, y + 2, 1);
};

const drawAlignment = (code, x, y) => {
  drawRect(code, x - 2, y - 2, x + 3, y + 3, 1);
  drawRect(code, x - 1, y - 1, x + 2, y + 2, 0);
  code.set(x, y, 1);
};

export const drawFrame = (code, version) => {
  const size = version * 4 + 17;
  drawPlacement(code, 3, 3);
  drawPlacement(code, size - 4, 3);
  drawPlacement(code, 3, size - 4);
  drawRect(code, 0, 7, 9, 9, 0);
  drawRect(code, 7, 0, 9, 7, 0);
  drawRect(code, size - 8, 7, size, 9, 0);
  drawRect(code, size - 8, 0, size - 7, 7, 0);
  drawRect(code, 7, size - 8, 9, size, 0);
  drawRect(code, 0, size - 8, 7, size - 7, 0);
  code.set(8, size - 8, 1);
  for (let i = 8; i < size - 8; ++i) {
    code.set(i, 6, !(i & 1));
    code.set(6, i, !(i & 1));
  }
  if (version >= 2) {
    const numAlignmentM = Math.floor(version / 7) + 1;
    // alignment boxes must always be positioned on even pixels
    // and are spaced evenly from the bottom right (except top and left which are always 6)
    // the -0.25 avoids a quirk in the spec for version 32
    const stepAlignment = Math.ceil((size - 13) / numAlignmentM / 2 - 0.25) * 2;
    const positions = [6];
    for (let i = numAlignmentM; (i--) > 0;) {
      positions.push(size - 7 - i * stepAlignment);
    }
    for (let i = 0; i <= numAlignmentM; ++i) {
      for (let j = 0; j <= numAlignmentM; ++j) {
        if (
          (!i && !j) ||
          (!i && j === numAlignmentM) ||
          (i === numAlignmentM && !j)
        ) {
          continue;
        }
        drawAlignment(code, positions[i], positions[j]);
      }
    }
  }
  if (version >= 7) {
    const vInfo = (version << 12) | remBinPoly(version, 0b1111100100101, 13);
    let m = 1 << 17;
    for (let j = 6; (j--) > 0;) {
      for (let i = 0; i < 3; ++i) {
        const state = vInfo & m;
        code.set(j, size - 9 - i, state);
        code.set(size - 9 - i, j, state);
        m >>>= 1;
      }
    }
  }
};

export const getPath = (code) => {
  const s = code.size;
  const result = [];
  for (let xB = s - 2, y = s, dirY = -1; xB >= 0; xB -= 2) {
    if (xB === 5) { // special case: skip vertical timing pattern line
      xB = 4;
    }
    /* eslint-disable no-cond-assign, no-sequences */
    while (y += dirY, y !== -1 && y !== s) {
      if (!code.masked(xB + 1, y)) {
        result.push([xB + 1, y]);
      }
      if (!code.masked(xB, y)) {
        result.push([xB, y]);
      }
    }
    /* eslint-enable no-cond-assign, no-sequences */
    dirY *= -1;
  }
  return result;
};

export const drawCode = (target, path, data) => {
  path.forEach(([x, y], bit) => target.set(x, y, (data[bit >> 3] << (bit & 7)) & 0x80, 0));
};

export const applyMask = (target, mask, maskId, ecId) => {
  for (let y = 0; y < target.size; ++y) {
    for (let x = 0; x < target.size; ++x) {
      if (mask(x, y) && !target.masked(x, y)) {
        target.inv(x, y);
      }
    }
  }
  const info = ((ecId << 3) | maskId);
  const pattern = 0b101010000010010 ^ ((info << 10) | remBinPoly(info, 0b10100110111, 11));
  let chk = 0b100000000000000;
  for (let i = 0; i < 7; ++i) {
    const state = pattern & chk;
    target.set(i === 6 ? 7 : i, 8, state);
    target.set(8, target.size - i - 1, state);
    chk >>>= 1;
  }
  for (let i = 0; i < 8; ++i) {
    const state = pattern & chk;
    target.set(8, (i > 1 ? 7 : 8) - i, state);
    target.set(target.size - 8 + i, 8, state);
    chk >>>= 1;
  }
};
