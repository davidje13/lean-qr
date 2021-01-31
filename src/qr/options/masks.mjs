export default [
  { id: 0b000, fn: (x, y) => !((x ^ y) & 1) },
  { id: 0b001, fn: (x, y) => !(y & 1) },
  { id: 0b010, fn: (x) => !(x % 3) },
  { id: 0b011, fn: (x, y) => !((x + y) % 3) },
  { id: 0b100, fn: (x, y) => !((Math.floor(x / 3) ^ Math.floor(y / 2)) & 1) },
  { id: 0b101, fn: (x, y) => !((x & y & 1) ^ ((x * y) % 3)) },
  { id: 0b110, fn: (x, y) => !(((x & y & 1) + ((x * y) % 3)) & 1) },
  { id: 0b111, fn: (x, y) => !((((x ^ y) & 1) + ((x * y) % 3)) & 1) },
];
