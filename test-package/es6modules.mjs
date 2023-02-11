import { generate } from 'lean-qr';
import { toSvgSource } from 'lean-qr/extras/svg';
import { shift_jis } from 'lean-qr/extras/jis';

if (typeof generate !== 'function') {
  throw new Error("import 'lean-qr' did not return generate function");
}

if (typeof toSvgSource !== 'function') {
  throw new Error(
    "import 'lean-qr/extras/svg' did not return toSvgSource function",
  );
}

if (typeof shift_jis !== 'function') {
  throw new Error("import 'lean-qr/extras/jis' did not return shift_jis mode");
}
