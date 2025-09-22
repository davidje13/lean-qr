import { generate, correction, mode } from 'lean-qr';
import { generate as generateNano } from 'lean-qr/nano';
import { toSvgDataURL, toSvgSource } from 'lean-qr/extras/svg';
import { toPngBuffer } from 'lean-qr/extras/node_export';
import {
  makeVueCanvasComponent,
  makeVueSvgComponent,
} from 'lean-qr/extras/vue';
import { readError } from 'lean-qr/extras/errors';
import { LeanQRElement } from 'lean-qr/webcomponent';
import { createApp, defineComponent, h } from '@vue/runtime-dom';

// this file just checks types; the code is not executed

const code = generate('foo');

const canvas = document.createElement('canvas');
code.toCanvas(canvas, { on: [0, 0, 0], off: [255, 255, 255, 0] });

const str = code.toString({ on: 'y', off: 'n' });
process.stdout.write(str);

const url = code.toDataURL({
  type: 'image/png',
  scale: 7,
  on: [0, 0, 0],
  off: [255, 255, 255, 0],
});
process.stdout.write(url);

const code2 = generate(mode.numeric('123'), {
  minVersion: 3,
  maxVersion: 10,
  minCorrectionLevel: correction.M,
  maxCorrectionLevel: correction.M,
  mask: 5,
  trailer: 5,
});
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

const element: HTMLElement = new LeanQRElement();
const element2: LeanQRElement = document.createElement('lean-qr');

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
code.toDataURL({ type: 'nope' });

// @ts-expect-error
toSvgSource('123');

// @ts-expect-error
toPngBuffer('123');

// @ts-expect-error
mode.shift_jis(1);

// @ts-expect-error
readError();

const nanoCode = generateNano('foo');
nanoCode.toCanvas(canvas, { on: [0, 0, 0], off: [255, 255, 255, 0] });

const nanoSvgSource = toSvgSource(nanoCode);
process.stdout.write(nanoSvgSource);
const nanoPngBuffer = toPngBuffer(nanoCode);
process.stdout.write(nanoPngBuffer.BYTES_PER_ELEMENT.toString());

generateNano('123', {
  minVersion: 3,
  minCorrectionLevel: correction.M,
});

// @ts-expect-error
generateNano(7);

// @ts-expect-error
generateNano('foo', { maxCorrectionLevel: correction.H });

// @ts-expect-error
generateNano(mode.numeric('123'));

// @ts-expect-error
generateNano('foo', { maxVersion: 5 });

// @ts-expect-error
generateNano('foo', { mask: 5 });

// @ts-expect-error
generateNano('foo', { trailer: 5 });

// @ts-expect-error
nanoCode.toString({ on: 'y', off: 'n' });

// @ts-expect-error
nanoCode.toDataURL();

const VueCanvasComponent = defineComponent(
  makeVueCanvasComponent({ h }, generate, {
    minVersion: 10,
    on: [0, 0, 0, 255],
  }),
);
createApp(VueCanvasComponent).mount('#root');

// @ts-expect-error
makeVueCanvasComponent({}, generate);

// @ts-expect-error
makeVueCanvasComponent({ h }, '');

// @ts-expect-error
makeVueCanvasComponent({ h }, generate, { scale: 2 });

const VueSvgComponent = defineComponent(
  makeVueSvgComponent({ h }, generate, toSvgDataURL, {
    minVersion: 10,
    scale: 2,
  }),
);
createApp(VueSvgComponent).mount('#root');

// @ts-expect-error
makeVueSvgComponent({}, generate, toSvgDataURL);

// @ts-expect-error
makeVueSvgComponent({ h }, '', toSvgDataURL);

// @ts-expect-error
makeVueSvgComponent({ h }, generate, '');

// @ts-expect-error
makeVueSvgComponent({ h }, generate, toSvgDataURL, { on: [0, 0, 0, 255] });
