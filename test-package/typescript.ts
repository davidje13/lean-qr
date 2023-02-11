import { generate, mode } from 'lean-qr';
import { toSvgSource } from 'lean-qr/extras/svg';
import { shift_jis } from 'lean-qr/extras/jis';

// this file just checks types; the code is not executed

const code = generate('foo');
const str = code.toString({ on: [0, 0, 0], off: [0, 0, 0, 0] });
process.stdout.write(str);

const code2 = generate(mode.numeric('123'), { minVersion: 3 });
const svgSource = toSvgSource(code2);
process.stdout.write(svgSource);

const code3 = generate(shift_jis('123'), { minVersion: 3 });
process.stdout.write(toSvgSource(code3, { padX: 2, xmlDeclaration: true }));

// @ts-expect-error
generate(7);

// @ts-expect-error
generate('hello', { minVersion: '1' });

// @ts-expect-error
code.toString({ on: 'red' });

// @ts-expect-error
toSvgSource('123');

// @ts-expect-error
shift_jis(1);
