const { generate } = require('lean-qr');
const { toSvgSource } = require('lean-qr/extras/svg');

if (typeof generate !== 'function') {
  throw new Error("require('lean-qr') did not return generate function");
}

if (typeof toSvgSource !== 'function') {
  throw new Error(
    "require('lean-qr/extras/svg') did not return toSvgSource function",
  );
}
