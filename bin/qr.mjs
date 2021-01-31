import { modes, corrections, generate } from '../src/index.mjs';

function print(code) {
  process.stdout.write(code.toString({
    on: '\u001B[7m  \u001B[0m',
    //on: '\u001B[40m  ',
    //off: '\u001B[107m  ',
    //lf: '\u001B[0m\n',
  }));
}

print(generate(modes.alphaNumeric('LEAN-QR LIBRARY')));

print(generate(modes.alphaNumeric('HELLO WORLD'), {
  minCorrectionLevel: corrections.Q,
}));

print(generate(modes.iso8859_1('http://en.m.wikipedia.org'), {
  minCorrectionLevel: corrections.Q,
  mask: 1,
}));

print(generate(modes.multi(modes.iso8859_1('https://en.wikipedia.org/wiki/'), modes.numeric('12345')), {
  minCorrectionLevel: corrections.Q,
}));

//print(generate(modes.multi(), {
//  minVersion: 40,
//}));
