export default [
  (x, y) => !((x ^ y) & 1),
  (x, y) => !(y & 1),
  (x) => !(x % 3),
  (x, y) => !((x + y) % 3),
  (x, y) => !((Math.floor(x / 3) ^ Math.floor(y / 2)) & 1),
  (x, y) => !((x & y & 1) ^ ((x * y) % 3)),
  (x, y) => !(((x & y & 1) + ((x * y) % 3)) & 1),
  (x, y) => !((((x ^ y) & 1) + ((x * y) % 3)) & 1),
];
