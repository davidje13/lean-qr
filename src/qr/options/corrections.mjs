/* eslint-disable array-bracket-spacing, no-multi-spaces, operator-linebreak */

function pixelsForVersion(version) {
  const size = version * 4 + 17;
  let total = (
    size * size            // total area
    - (9 * 9 + 9 * 8 * 2)  // placement
    - (size - (9 + 8)) * 2 // timing pattern
  );
  if (version >= 2) {
    const numAlignment = Math.floor(version / 7) + 2;
    total -= (
      5 * 5 * (numAlignment * numAlignment - 3) // alignment blocks
      - 5 * 2 * (numAlignment - 2) // do not overcount timing pattern/alignment overlap
    );
  }
  if (version >= 7) {
    total -= 3 * 6 * 2; // version identifiers
  }
  return total;
}

function calculate(data) {
  const versions = [{}];
  for (let version = 1; version <= 40; ++version) {
    const totalBytes = Math.floor(pixelsForVersion(version) / 8);
    const [capacity, ecsize] = data[version - 1];
    const bsize = Math.floor((capacity * ecsize) / (totalBytes - capacity));
    const totalBlocks = Math.floor(capacity / bsize);
    const g2n = capacity - (totalBlocks * bsize);
    const g1n = totalBlocks - g2n;
    const groups = [[g1n, bsize]];
    if (g2n) {
      groups.push([g2n, bsize + 1]);
    }
    versions.push({
      capBits: capacity * 8,
      groups,
      ecsize,
    });
  }
  return versions;
}

// TODO: identify algorithm for these values
// Thanks, https://www.thonky.com/qr-code-tutorial/error-correction-table

const LData = [
  [  19,  7], [  34, 10], [  55, 15], [  80, 20], [ 108, 26],
  [ 136, 18], [ 156, 20], [ 194, 24], [ 232, 30], [ 274, 18],
  [ 324, 20], [ 370, 24], [ 428, 26], [ 461, 30], [ 523, 22],
  [ 589, 24], [ 647, 28], [ 721, 30], [ 795, 28], [ 861, 28],
  [ 932, 28], [1006, 28], [1094, 30], [1174, 30], [1276, 26],
  [1370, 28], [1468, 30], [1531, 30], [1631, 30], [1735, 30],
  [1843, 30], [1955, 30], [2071, 30], [2191, 30], [2306, 30],
  [2434, 30], [2566, 30], [2702, 30], [2812, 30], [2956, 30],
];

const MData = [
  [  16, 10], [  28, 16], [  44, 26], [  64, 18], [  86, 24],
  [ 108, 16], [ 124, 18], [ 154, 22], [ 182, 22], [ 216, 26],
  [ 254, 30], [ 290, 22], [ 334, 22], [ 365, 24], [ 415, 24],
  [ 453, 28], [ 507, 28], [ 563, 26], [ 627, 26], [ 669, 26],
  [ 714, 26], [ 782, 28], [ 860, 28], [ 914, 28], [1000, 28],
  [1062, 28], [1128, 28], [1193, 28], [1267, 28], [1373, 28],
  [1455, 28], [1541, 28], [1631, 28], [1725, 28], [1812, 28],
  [1914, 28], [1992, 28], [2102, 28], [2216, 28], [2334, 28],
];

const QData = [
  [  13, 13], [  22, 22], [  34, 18], [  48, 26], [  62, 18],
  [  76, 24], [  88, 18], [ 110, 22], [ 132, 20], [ 154, 24],
  [ 180, 28], [ 206, 26], [ 244, 24], [ 261, 20], [ 295, 30],
  [ 325, 24], [ 367, 28], [ 397, 28], [ 445, 26], [ 485, 30],
  [ 512, 28], [ 568, 30], [ 614, 30], [ 664, 30], [ 718, 30],
  [ 754, 28], [ 808, 30], [ 871, 30], [ 911, 30], [ 985, 30],
  [1033, 30], [1115, 30], [1171, 30], [1231, 30], [1286, 30],
  [1354, 30], [1426, 30], [1502, 30], [1582, 30], [1666, 30],
];

const HData = [
  [   9, 17], [  16, 28], [  26, 22], [  36, 16], [  46, 22],
  [  60, 28], [  66, 26], [  86, 26], [ 100, 24], [ 122, 28],
  [ 140, 24], [ 158, 28], [ 180, 22], [ 197, 24], [ 223, 24],
  [ 253, 30], [ 283, 28], [ 313, 28], [ 341, 26], [ 385, 28],
  [ 406, 30], [ 442, 24], [ 464, 30], [ 514, 30], [ 538, 30],
  [ 596, 30], [ 628, 30], [ 661, 30], [ 701, 30], [ 745, 30],
  [ 793, 30], [ 845, 30], [ 901, 30], [ 961, 30], [ 986, 30],
  [1054, 30], [1096, 30], [1142, 30], [1222, 30], [1276, 30],
];

export const data = [
  { id: 0b01, v: calculate(LData) },
  { id: 0b00, v: calculate(MData) },
  { id: 0b11, v: calculate(QData) },
  { id: 0b10, v: calculate(HData) },
];

export const names = {
  min: 0,
  L: 0,
  M: 1,
  Q: 2,
  H: 3,
  max: 3,
};
