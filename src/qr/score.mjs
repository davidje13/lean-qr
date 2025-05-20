const initial = 0b10000000000_10000000000;
const pattern = 0b10111010000_00001011101;
const matches = 0b00000000001_00000000001;

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
          consec = 0;
        }
        last = cur;
        score += ++consec === 5 ? 3 : consec > 5;
      }
    }
    if (i) {
      for (
        let j = size + i, last = (_data[i - 1] * 5) ^ _data[i];
        j < size * size;
        j += size
      ) {
        const cur = (_data[j - 1] * 5) ^ _data[j];
        score += !(((last | cur) & 1) | ((last ^ cur) & 4)) * 3;
        last = cur;
      }
    }
  }
  return score + ((10 * Math.abs(totalOn / (size * size) - 1)) | 0) * 10;
};
