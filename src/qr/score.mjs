// only scoreCode is used for actual scoring; the other methods here
// provide a useful comparison for testing at a more atomic level.

const hv = ({ size, get }, state0, fn) => {
  for (let i = 0; i < size; ++i) {
    for (let j = 0, stateX = state0, stateY = state0; j < size; ++j) {
      stateX = fn(stateX, get(j, i));
      stateY = fn(stateY, get(i, j));
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

export const countBoxes = ({ size, get }, score = 0) => {
  for (let x = 1; x < size; ++x) {
    for (
      let y = 1, lastV = get(x - 1, 0), lastM = get(x, 0) === lastV;
      y < size;
      ++y
    ) {
      const curV = get(x - 1, y);
      const curM = get(x, y) === curV;
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

export const scoreCode = ({ size, _data }, score = 0, totalOn = 0) => {
  for (let i = 0; i < size; ++i) {
    for (let n = 0; n < 2; ++n) {
      for (let j = 0, state = 0, consec = 0, last; j < size; ++j) {
        const cur = _data[n ? i * size + j : j * size + i] & 1;
        totalOn += cur;
        state = ((state >> 1) | initial) & (pattern ^ (cur - 1));
        if (state & matches) {
          score += 40;
        }
        if (cur !== last) {
          consec = 1;
          last = cur;
        } else if (++consec > 4) {
          score += consec < 6 ? 3 : 1;
        }
      }
    }
    if (i) {
      for (
        let y = 1, lastV = _data[i - 1] & 1, lastM = (_data[i] & 1) === lastV;
        y < size;
        ++y
      ) {
        const curV = _data[y * size + i - 1] & 1;
        const curM = (_data[y * size + i] & 1) === curV;
        score += (lastM && curM && lastV === curV) * 3;
        lastV = curV;
        lastM = curM;
      }
    }
  }
  return score + ((20 * Math.abs(totalOn / (size * size * 2) - 0.5)) | 0) * 10;
};
