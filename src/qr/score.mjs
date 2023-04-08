const hv = (code, state0, fn) => {
  for (let i = 0; i < code.size; ++i) {
    for (let j = 0, stateX = state0, stateY = state0; j < code.size; ++j) {
      stateX = fn(stateX, code.get(j, i));
      stateY = fn(stateY, code.get(i, j));
    }
  }
};

export const scoreLines = (code, score = 0) => {
  hv(code, [0], ([consec, last], cur) => {
    if (cur !== last) {
      return [1, cur];
    }
    if (consec === 4) {
      score += 3;
    } else if (consec > 4) {
      ++score;
    }
    return [consec + 1, last];
  });
  return score;
};

export const countBoxes = (code, score = 0) => {
  for (let x = 1; x < code.size; ++x) {
    for (
      let y = 1, lastV = code.get(x - 1, 0), lastM = code.get(x, 0) === lastV;
      y < code.size;
      ++y
    ) {
      const curV = code.get(x - 1, y);
      const curM = code.get(x, y) === curV;
      score += lastM && curM && lastV === curV;
      lastV = curV;
      lastM = curM;
    }
  }
  return score;
};

const initial = 0b10000000000_10000000000;
const pattern = 0b10111010000_00001011101;
const matches = 0b00000000001_00000000001;

export const countPatterns = (code, score = 0) => {
  hv(code, 0, (state, cur) => {
    const next = ((state >> 1) | initial) & (pattern ^ (cur - 1));
    if (next & matches) {
      ++score;
    }
    return next;
  });
  return score;
};

export const scoreImbalance = (code, totalOn = 0) => {
  hv(code, 0, (_, cur) => (totalOn += cur));
  return (20 * Math.abs(totalOn / (code.size * code.size * 2) - 0.5)) | 0;
};

export const scoreCode = (code) =>
  scoreLines(code) +
  countBoxes(code) * 3 +
  countPatterns(code) * 40 +
  scoreImbalance(code) * 10;
