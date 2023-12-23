import { generate, mode } from 'lean-qr';
import { toSvgSource } from 'lean-qr/extras/svg';
import { toPngBuffer } from 'lean-qr/extras/node_export';
import { readError } from 'lean-qr/extras/errors';

// this file just checks types; the code is not executed

const code = generate('foo');

const canvas = document.createElement('canvas');
code.toCanvas(canvas, { on: [0, 0, 0], off: [255, 255, 255, 0] });

const str = code.toString({ on: 'y', off: 'n' });
process.stdout.write(str);

const code2 = generate(mode.numeric('123'), { minVersion: 3 });
const svgSource = toSvgSource(code2);
process.stdout.write(svgSource);
const pngBuffer = toPngBuffer(code);
process.stdout.write(pngBuffer.BYTES_PER_ELEMENT.toString());

const customMode = Object.assign(() => () => null, {
  test: () => true,
  est: () => 0,
});

const code3 = generate(mode.shift_jis('123'), { minVersion: 3 });
process.stdout.write(toSvgSource(code3, { padX: 2, xmlDeclaration: true }));
process.stdout.write(toPngBuffer(code3, { padX: 2, scale: 10 }).toString());

try {
  const code4 = generate.with(customMode)('123');
  process.stdout.write(code4.get(0, 0) ? 'y' : 'n');
} catch (e) {
  process.stderr.write(readError(e));
}

mode.auto('', {
  modes: [
    mode.numeric,
    mode.alphaNumeric,
    mode.ascii,
    mode.iso8859_1,
    mode.utf8,
    mode.shift_jis,
    customMode,
  ],
});

// @ts-expect-error
mode.auto('', { modes: [mode.bytes] });

// @ts-expect-error
mode.auto('', { modes: [mode.eci] });

// @ts-expect-error
mode.auto('', { modes: [mode.auto] });

// @ts-expect-error
generate(7);

// @ts-expect-error
generate('hello', { minVersion: '1' });

const badCustomMode = Object.assign(() => () => null, {
  test: () => true,
});

// @ts-expect-error
generate.with(badCustomMode);

// @ts-expect-error
generate.with(customMode)(7);

// @ts-expect-error
generate.with(7)('hello');

// @ts-expect-error
generate.with(customMode).with(customMode)('hello');

// @ts-expect-error
code.toCanvas(canvas, { on: [0, 0], off: [255, 255, 255, 0] });

// @ts-expect-error
code.toCanvas({}, { on: [0, 0, 0], off: [255, 255, 255, 0] });

// @ts-expect-error
code.toString({ on: [0, 0, 0] });

// @ts-expect-error
toSvgSource('123');

// @ts-expect-error
toPngBuffer('123');

// @ts-expect-error
mode.shift_jis(1);

// @ts-expect-error
readError();
