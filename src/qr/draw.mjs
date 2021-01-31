function remBinPoly(num, den, denBits) {
  let remainder = num << (denBits - 1);
  for (let i = 0x40000000; i; i >>>= 1) {
    if (remainder & i) {
      remainder ^= den * (i >>> (denBits - 1));
    }
  }
  return remainder;
}

function drawRect(code, x1, y1, x2, y2, value) {
  for (let y = y1; y < y2; ++y) {
    for (let x = x1; x < x2; ++x) {
      code.set(x, y, value);
    }
  }
}

function drawRectOutline(code, x1, y1, x2, y2, value) {
  drawRect(code, x1, y1, x2, y1 + 1, value);
  drawRect(code, x1, y1 + 1, x1 + 1, y2, value);
  drawRect(code, x2 - 1, y1 + 1, x2, y2, value);
  drawRect(code, x1 + 1, y2 - 1, x2 - 1, y2, value);
}

function drawPlacement(code, x, y) {
  drawRectOutline(code, x - 3, y - 3, x + 4, y + 4, 1);
  drawRectOutline(code, x - 2, y - 2, x + 3, y + 3, 0);
  drawRect(code, x - 1, y - 1, x + 2, y + 2, 1);
}

function drawAlignment(code, x, y) {
  drawRectOutline(code, x - 2, y - 2, x + 3, y + 3, 1);
  drawRectOutline(code, x - 1, y - 1, x + 2, y + 2, 0);
  code.set(x, y, 1);
}

export function drawFrame(code, version) {
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
    const numAlignment = Math.floor(version / 7) + 2;
    const stepAlignment = (size - 13) / (numAlignment - 1);
    for (let i = 0; i < numAlignment; ++i) {
      for (let j = 0; j < numAlignment; ++j) {
        if (
          (i === 0 && j === 0) ||
          (i === 0 && j === numAlignment - 1) ||
          (i === numAlignment - 1 && j === 0)
        ) {
          continue;
        }
        drawAlignment(code, i * stepAlignment + 6, j * stepAlignment + 6);
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
}

export function getPath(code) {
  const w = code.width;
  const h = code.height;
  const result = [];
  let dirY = -1;
  let y = h;
  for (let xB = w - 2; xB >= 0; xB -= 2) {
    if (xB === 5) { // special case: skip vertical timing pattern line
      xB = 4;
    }
    for (y += dirY; y !== -1 && y !== h; y += dirY) {
      if (!code.masked(xB + 1, y)) {
        result.push([xB + 1, y]);
      }
      if (!code.masked(xB, y)) {
        result.push([xB, y]);
      }
    }
    dirY *= -1;
  }
  return result;
}

export function drawCode(target, path, data) {
  let byte = 0;
  let bit = 0b10000000;
  path.forEach(([x, y]) => {
    const v = data[byte] & bit;
    target.set(x, y, v, 0);
    bit >>>= 1;
    if (!bit) {
      ++byte;
      bit = 0b10000000;
    }
  });
}

export function applyMask(target, mask, maskId, ecId) {
  for (let y = 0; y < target.height; ++y) {
    for (let x = 0; x < target.width; ++x) {
      target.xorNoMask(x, y, mask(x, y));
    }
  }
  const info = ((ecId << 3) | maskId);
  const pattern = 0b101010000010010 ^ ((info << 10) | remBinPoly(info, 0b10100110111, 11));
  let chk = 0b100000000000000;
  for (let i = 0; i < 7; ++i) {
    const state = pattern & chk;
    target.set(i === 6 ? 7 : i, 8, state);
    target.set(8, target.height - i - 1, state);
    chk >>>= 1;
  }
  for (let i = 0; i < 8; ++i) {
    const state = pattern & chk;
    target.set(8, (i > 1 ? 7 : 8) - i, state);
    target.set(target.width - 8 + i, 8, state);
    chk >>>= 1;
  }
}
