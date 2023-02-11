const { generate } = require('lean-qr');
const { toSvgSource } = require('lean-qr/extras/svg');
const { shift_jis } = require('lean-qr/extras/jis');

if (typeof generate !== 'function') {
  throw new Error("require('lean-qr') did not return generate function");
}

if (typeof toSvgSource !== 'function') {
  throw new Error(
    "require('lean-qr/extras/svg') did not return toSvgSource function",
  );
}

if (typeof shift_jis !== 'function') {
  throw new Error(
    "require('lean-qr/extras/jis') did not return shift_jis mode",
  );
}
