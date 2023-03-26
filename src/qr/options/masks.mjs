export const masks = [
  (x, y) => !((x ^ y) & 1),
  (x, y) => !(y & 1),
  (x) => !(x % 3),
  (x, y) => !((x + y) % 3),
  (x, y) => !((((x / 3) | 0) ^ (y >> 1)) & 1),
  (x, y) => !((x & y & 1) + ((x * y) % 3)),
  (x, y) => !(((x & y & 1) + ((x * y) % 3)) & 1),
  (x, y) => !((((x ^ y) & 1) + ((x * y) % 3)) & 1),
];
