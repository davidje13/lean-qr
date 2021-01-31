import { modes, corrections, generate } from '../src/index.mjs';

//const COL = ['\u001B[107m', '\u001B[40m', '\u001B[0m'];
const COL = ['\u001B[0m', '\u001B[7m', '\u001B[0m'];
const CELL = ['  ', '  '];
const PAD_X = 4;
const PAD_Y = 3;

function print(code) {
  for (let y = 0; y < PAD_Y; ++y) {
    process.stdout.write(COL[0]);
    for (let x = 0; x < code.size + PAD_X * 2; ++x) {
      process.stdout.write(CELL[0]);
    }
    process.stdout.write(COL[2] + '\n');
  }
  for (let y = 0; y < code.size; ++y) {
    process.stdout.write(COL[0]);
    for (let x = 0; x < PAD_X; ++x) {
      process.stdout.write(CELL[0]);
    }
    for (let x = 0; x < code.size; ++x) {
      const v = code.get(x, y) | 0;
      process.stdout.write(COL[v] + CELL[v]);
    }
    process.stdout.write(COL[0]);
    for (let x = 0; x < PAD_X; ++x) {
      process.stdout.write(CELL[0]);
    }
    process.stdout.write(COL[2] + '\n');
  }
  for (let y = 0; y < PAD_Y; ++y) {
    process.stdout.write(COL[0]);
    for (let x = 0; x < code.size + PAD_X * 2; ++x) {
      process.stdout.write(CELL[0]);
    }
    process.stdout.write(COL[2] + '\n');
  }
}

//print(generate(modes.alphaNumeric('HELLO WORLD'), {
//  correctionLevel: corrections.Q,
//}));

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
