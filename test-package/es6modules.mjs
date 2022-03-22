import { generate } from 'lean-qr';
import { toSvgSource } from 'lean-qr/extras/svg';

if (typeof generate !== 'function') {
  throw new Error("import 'lean-qr' did not return generate function");
}

if (typeof toSvgSource !== 'function') {
  throw new Error(
    "import 'lean-qr/extras/svg' did not return toSvgSource function",
  );
}
