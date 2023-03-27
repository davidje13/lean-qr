import { generate, mode } from 'lean-qr';
import { toSvgSource } from 'lean-qr/extras/svg';

// this file just checks types; the code is not executed

const code = generate('foo');
const str = code.toString({ on: [0, 0, 0], off: [0, 0, 0, 0] });
process.stdout.write(str);

const code2 = generate(mode.numeric('123'), { minVersion: 3 });
const svgSource = toSvgSource(code2);
process.stdout.write(svgSource);

const customMode = Object.assign(() => () => null, {
  test: () => true,
  est: () => 0,
});

const code3 = generate(mode.shift_jis('123'), { minVersion: 3 });
process.stdout.write(toSvgSource(code3, { padX: 2, xmlDeclaration: true }));

const code4 = generate.with(customMode)('123');
process.stdout.write(code4.get(0, 0) ? 'y' : 'n');

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
code.toString({ on: 'red' });

// @ts-expect-error
toSvgSource('123');

// @ts-expect-error
mode.shift_jis(1);
