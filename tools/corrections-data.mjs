// TODO: identify algorithm for these values
// Thanks, https://www.thonky.com/qr-code-tutorial/error-correction-table

/* prettier-ignore */
export const DATA_L = [
  { g2:  0, g1:  1, g1s:  19, ecs:  7 },
  { g2:  0, g1:  1, g1s:  34, ecs: 10 },
  { g2:  0, g1:  1, g1s:  55, ecs: 15 },
  { g2:  0, g1:  1, g1s:  80, ecs: 20 },
  { g2:  0, g1:  1, g1s: 108, ecs: 26 },
  { g2:  0, g1:  2, g1s:  68, ecs: 18 },
  { g2:  0, g1:  2, g1s:  78, ecs: 20 },
  { g2:  0, g1:  2, g1s:  97, ecs: 24 },
  { g2:  0, g1:  2, g1s: 116, ecs: 30 },
  { g2:  2, g1:  2, g1s:  68, ecs: 18 },
  { g2:  0, g1:  4, g1s:  81, ecs: 20 },
  { g2:  2, g1:  2, g1s:  92, ecs: 24 },
  { g2:  0, g1:  4, g1s: 107, ecs: 26 },
  { g2:  1, g1:  3, g1s: 115, ecs: 30 },
  { g2:  1, g1:  5, g1s:  87, ecs: 22 },
  { g2:  1, g1:  5, g1s:  98, ecs: 24 },
  { g2:  5, g1:  1, g1s: 107, ecs: 28 },
  { g2:  1, g1:  5, g1s: 120, ecs: 30 },
  { g2:  4, g1:  3, g1s: 113, ecs: 28 },
  { g2:  5, g1:  3, g1s: 107, ecs: 28 },
  { g2:  4, g1:  4, g1s: 116, ecs: 28 },
  { g2:  7, g1:  2, g1s: 111, ecs: 28 },
  { g2:  5, g1:  4, g1s: 121, ecs: 30 },
  { g2:  4, g1:  6, g1s: 117, ecs: 30 },
  { g2:  4, g1:  8, g1s: 106, ecs: 26 },
  { g2:  2, g1: 10, g1s: 114, ecs: 28 },
  { g2:  4, g1:  8, g1s: 122, ecs: 30 },
  { g2: 10, g1:  3, g1s: 117, ecs: 30 },
  { g2:  7, g1:  7, g1s: 116, ecs: 30 },
  { g2: 10, g1:  5, g1s: 115, ecs: 30 },
  { g2:  3, g1: 13, g1s: 115, ecs: 30 },
  { g2:  0, g1: 17, g1s: 115, ecs: 30 },
  { g2:  1, g1: 17, g1s: 115, ecs: 30 },
  { g2:  6, g1: 13, g1s: 115, ecs: 30 },
  { g2:  7, g1: 12, g1s: 121, ecs: 30 },
  { g2: 14, g1:  6, g1s: 121, ecs: 30 },
  { g2:  4, g1: 17, g1s: 122, ecs: 30 },
  { g2: 18, g1:  4, g1s: 122, ecs: 30 },
  { g2:  4, g1: 20, g1s: 117, ecs: 30 },
  { g2:  6, g1: 19, g1s: 118, ecs: 30 },
];

/* prettier-ignore */
export const DATA_M = [
  { g2:  0, g1:  1, g1s:  16, ecs: 10 },
  { g2:  0, g1:  1, g1s:  28, ecs: 16 },
  { g2:  0, g1:  1, g1s:  44, ecs: 26 },
  { g2:  0, g1:  2, g1s:  32, ecs: 18 },
  { g2:  0, g1:  2, g1s:  43, ecs: 24 },
  { g2:  0, g1:  4, g1s:  27, ecs: 16 },
  { g2:  0, g1:  4, g1s:  31, ecs: 18 },
  { g2:  2, g1:  2, g1s:  38, ecs: 22 },
  { g2:  2, g1:  3, g1s:  36, ecs: 22 },
  { g2:  1, g1:  4, g1s:  43, ecs: 26 },
  { g2:  4, g1:  1, g1s:  50, ecs: 30 },
  { g2:  2, g1:  6, g1s:  36, ecs: 22 },
  { g2:  1, g1:  8, g1s:  37, ecs: 22 },
  { g2:  5, g1:  4, g1s:  40, ecs: 24 },
  { g2:  5, g1:  5, g1s:  41, ecs: 24 },
  { g2:  3, g1:  7, g1s:  45, ecs: 28 },
  { g2:  1, g1: 10, g1s:  46, ecs: 28 },
  { g2:  4, g1:  9, g1s:  43, ecs: 26 },
  { g2: 11, g1:  3, g1s:  44, ecs: 26 },
  { g2: 13, g1:  3, g1s:  41, ecs: 26 },
  { g2:  0, g1: 17, g1s:  42, ecs: 26 },
  { g2:  0, g1: 17, g1s:  46, ecs: 28 },
  { g2: 14, g1:  4, g1s:  47, ecs: 28 },
  { g2: 14, g1:  6, g1s:  45, ecs: 28 },
  { g2: 13, g1:  8, g1s:  47, ecs: 28 },
  { g2:  4, g1: 19, g1s:  46, ecs: 28 },
  { g2:  3, g1: 22, g1s:  45, ecs: 28 },
  { g2: 23, g1:  3, g1s:  45, ecs: 28 },
  { g2:  7, g1: 21, g1s:  45, ecs: 28 },
  { g2: 10, g1: 19, g1s:  47, ecs: 28 },
  { g2: 29, g1:  2, g1s:  46, ecs: 28 },
  { g2: 23, g1: 10, g1s:  46, ecs: 28 },
  { g2: 21, g1: 14, g1s:  46, ecs: 28 },
  { g2: 23, g1: 14, g1s:  46, ecs: 28 },
  { g2: 26, g1: 12, g1s:  47, ecs: 28 },
  { g2: 34, g1:  6, g1s:  47, ecs: 28 },
  { g2: 14, g1: 29, g1s:  46, ecs: 28 },
  { g2: 32, g1: 13, g1s:  46, ecs: 28 },
  { g2:  7, g1: 40, g1s:  47, ecs: 28 },
  { g2: 31, g1: 18, g1s:  47, ecs: 28 },
];

/* prettier-ignore */
export const DATA_Q = [
  { g2:  0, g1:  1, g1s:  13, ecs: 13 },
  { g2:  0, g1:  1, g1s:  22, ecs: 22 },
  { g2:  0, g1:  2, g1s:  17, ecs: 18 },
  { g2:  0, g1:  2, g1s:  24, ecs: 26 },
  { g2:  2, g1:  2, g1s:  15, ecs: 18 },
  { g2:  0, g1:  4, g1s:  19, ecs: 24 },
  { g2:  4, g1:  2, g1s:  14, ecs: 18 },
  { g2:  2, g1:  4, g1s:  18, ecs: 22 },
  { g2:  4, g1:  4, g1s:  16, ecs: 20 },
  { g2:  2, g1:  6, g1s:  19, ecs: 24 },
  { g2:  4, g1:  4, g1s:  22, ecs: 28 },
  { g2:  6, g1:  4, g1s:  20, ecs: 26 },
  { g2:  4, g1:  8, g1s:  20, ecs: 24 },
  { g2:  5, g1: 11, g1s:  16, ecs: 20 },
  { g2:  7, g1:  5, g1s:  24, ecs: 30 },
  { g2:  2, g1: 15, g1s:  19, ecs: 24 },
  { g2: 15, g1:  1, g1s:  22, ecs: 28 },
  { g2:  1, g1: 17, g1s:  22, ecs: 28 },
  { g2:  4, g1: 17, g1s:  21, ecs: 26 },
  { g2:  5, g1: 15, g1s:  24, ecs: 30 },
  { g2:  6, g1: 17, g1s:  22, ecs: 28 },
  { g2: 16, g1:  7, g1s:  24, ecs: 30 },
  { g2: 14, g1: 11, g1s:  24, ecs: 30 },
  { g2: 16, g1: 11, g1s:  24, ecs: 30 },
  { g2: 22, g1:  7, g1s:  24, ecs: 30 },
  { g2:  6, g1: 28, g1s:  22, ecs: 28 },
  { g2: 26, g1:  8, g1s:  23, ecs: 30 },
  { g2: 31, g1:  4, g1s:  24, ecs: 30 },
  { g2: 37, g1:  1, g1s:  23, ecs: 30 },
  { g2: 25, g1: 15, g1s:  24, ecs: 30 },
  { g2:  1, g1: 42, g1s:  24, ecs: 30 },
  { g2: 35, g1: 10, g1s:  24, ecs: 30 },
  { g2: 19, g1: 29, g1s:  24, ecs: 30 },
  { g2:  7, g1: 44, g1s:  24, ecs: 30 },
  { g2: 14, g1: 39, g1s:  24, ecs: 30 },
  { g2: 10, g1: 46, g1s:  24, ecs: 30 },
  { g2: 10, g1: 49, g1s:  24, ecs: 30 },
  { g2: 14, g1: 48, g1s:  24, ecs: 30 },
  { g2: 22, g1: 43, g1s:  24, ecs: 30 },
  { g2: 34, g1: 34, g1s:  24, ecs: 30 },
];

/* prettier-ignore */
export const DATA_H = [
  { g2:  0, g1:  1, g1s:   9, ecs: 17 },
  { g2:  0, g1:  1, g1s:  16, ecs: 28 },
  { g2:  0, g1:  2, g1s:  13, ecs: 22 },
  { g2:  0, g1:  4, g1s:   9, ecs: 16 },
  { g2:  2, g1:  2, g1s:  11, ecs: 22 },
  { g2:  0, g1:  4, g1s:  15, ecs: 28 },
  { g2:  1, g1:  4, g1s:  13, ecs: 26 },
  { g2:  2, g1:  4, g1s:  14, ecs: 26 },
  { g2:  4, g1:  4, g1s:  12, ecs: 24 },
  { g2:  2, g1:  6, g1s:  15, ecs: 28 },
  { g2:  8, g1:  3, g1s:  12, ecs: 24 },
  { g2:  4, g1:  7, g1s:  14, ecs: 28 },
  { g2:  4, g1: 12, g1s:  11, ecs: 22 },
  { g2:  5, g1: 11, g1s:  12, ecs: 24 },
  { g2:  7, g1: 11, g1s:  12, ecs: 24 },
  { g2: 13, g1:  3, g1s:  15, ecs: 30 },
  { g2: 17, g1:  2, g1s:  14, ecs: 28 },
  { g2: 19, g1:  2, g1s:  14, ecs: 28 },
  { g2: 16, g1:  9, g1s:  13, ecs: 26 },
  { g2: 10, g1: 15, g1s:  15, ecs: 28 },
  { g2:  6, g1: 19, g1s:  16, ecs: 30 },
  { g2:  0, g1: 34, g1s:  13, ecs: 24 },
  { g2: 14, g1: 16, g1s:  15, ecs: 30 },
  { g2:  2, g1: 30, g1s:  16, ecs: 30 },
  { g2: 13, g1: 22, g1s:  15, ecs: 30 },
  { g2:  4, g1: 33, g1s:  16, ecs: 30 },
  { g2: 28, g1: 12, g1s:  15, ecs: 30 },
  { g2: 31, g1: 11, g1s:  15, ecs: 30 },
  { g2: 26, g1: 19, g1s:  15, ecs: 30 },
  { g2: 25, g1: 23, g1s:  15, ecs: 30 },
  { g2: 28, g1: 23, g1s:  15, ecs: 30 },
  { g2: 35, g1: 19, g1s:  15, ecs: 30 },
  { g2: 46, g1: 11, g1s:  15, ecs: 30 },
  { g2:  1, g1: 59, g1s:  16, ecs: 30 },
  { g2: 41, g1: 22, g1s:  15, ecs: 30 },
  { g2: 64, g1:  2, g1s:  15, ecs: 30 },
  { g2: 46, g1: 24, g1s:  15, ecs: 30 },
  { g2: 32, g1: 42, g1s:  15, ecs: 30 },
  { g2: 67, g1: 10, g1s:  15, ecs: 30 },
  { g2: 61, g1: 20, g1s:  15, ecs: 30 },
];
