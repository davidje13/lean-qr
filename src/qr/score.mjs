const hv = (code, state0, fn) => {
  for (let i = 0; i < code.size; ++i) {
    let stateX = state0;
    let stateY = state0;
    for (let j = 0; j < code.size; ++j) {
      stateX = fn(stateX, code.get(j, i));
      stateY = fn(stateY, code.get(i, j));
    }
  }
};

export const scoreLines = (code) => {
  let score = 0;
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

export const countBoxes = (code) => {
  let score = 0;
  for (let x = 1; x < code.size; ++x) {
    let lastV = code.get(x - 1, 0);
    let lastM = code.get(x, 0) === lastV;
    for (let y = 1; y < code.size; ++y) {
      const curV = code.get(x - 1, y);
      const curM = code.get(x, y) === curV;
      score += (lastM && curM && lastV === curV);
      lastV = curV;
      lastM = curM;
    }
  }
  return score;
};

export const countPatterns = (code) => {
  let score = 0;
  /* eslint-disable no-multi-spaces */
  const begin   = 0b10000000000_10000000000;
  const pattern = 0b10111010000_00001011101;
  const end     = 0b00000000001_00000000001;
  /* eslint-enable no-multi-spaces */
  hv(code, 0, (state, cur) => {
    const next = ((state >>> 1) | begin) & (pattern ^ (cur ? 0 : -1));
    if (next & end) {
      ++score;
    }
    return next;
  });
  return score;
};

export const scoreImbalance = (code) => {
  let totalOn = 0;
  for (let y = 0; y < code.size; ++y) {
    for (let x = 0; x < code.size; ++x) {
      totalOn += code.get(x, y);
    }
  }
  return Math.floor(20 * Math.abs(totalOn / (code.size * code.size) - 0.5)) * 10;
};

export default (code) => (
  scoreLines(code) +
  countBoxes(code) * 3 +
  countPatterns(code) * 40 +
  scoreImbalance(code)
);
