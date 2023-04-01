import fs from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PNG } from 'pngjs';

const SELF_DIR = dirname(fileURLToPath(import.meta.url));

export function loadImage(name) {
  const fileBuffer = fs.readFileSync(join(SELF_DIR, name));
  const { width, height, data } = PNG.sync.read(fileBuffer);
  let result = '';
  for (let y = 0; y < height; ++y) {
    for (let x = 0; x < width; ++x) {
      const p = (y * width + x) * 4;
      const r = data[p] > 128;
      const g = data[p + 1] > 128;
      const b = data[p + 2] > 128;
      if (r && !g && !b) {
        result += '?';
      } else if (r && g && b) {
        result += ' ';
      } else {
        result += '#';
      }
    }
    result += '\n';
  }
  return result;
}

function toLines(str) {
  const lines = str.split('\n');
  if (!lines[lines.length - 1]) {
    --lines.length;
  }
  const width = Math.min(...lines.map((ln) => ln.length));
  if (Math.max(...lines.map((ln) => ln.length)) !== width) {
    throw new Error(`Image has inconsistent line lengths:\n${str}`);
  }
  return { width, height: lines.length, data: lines };
}

function makeVisible(img) {
  return img.replace(/ /g, '\u00B7');
}

export const toMatchImage = (expectedImage) => (actualImage) => {
  if (typeof expectedImage !== 'string') {
    throw new Error('Image expectation should be a string pattern');
  }
  if (actualImage && typeof actualImage === 'object') {
    actualImage = actualImage.toString({
      on: '#',
      off: ' ',
      lf: '\n',
      padX: 0,
      padY: 0,
    });
  }
  if (typeof actualImage !== 'string') {
    throw new Error(`Expected image, got ${actualImage}`);
  }
  const colExpected = (v) => v;
  const colReceived = (v) => v;
  const colInvert = (v) => `\u001B[7m${v}\u001B[27m`;
  const msgPrefix = 'toMatchImage';
  const actual = toLines(actualImage);
  const expected = toLines(expectedImage);
  if (actual.width !== expected.width || actual.height !== expected.height) {
    return {
      pass: false,
      message: () =>
        `${msgPrefix}\n\n` +
        `Expected: image of size ${colExpected(expected.width)}` +
        `x${colExpected(expected.height)}\n` +
        `Received: image of size ${colReceived(actual.width)}` +
        `x${colReceived(actual.height)}\n`,
    };
  }

  const col2 = Math.max(actual.width, 'Expected:'.length) + 6;
  const pad = ' '.repeat(col2 - actual.width);
  const stacked = actual.width >= 60;
  let vis = colExpected('Expected:');
  let vis2 = '';
  if (stacked) {
    vis2 = `\n\n${colReceived('Received:')}\n`;
  } else {
    vis += ' '.repeat(col2 - 'Expected:'.length);
    vis += colReceived('Received:');
  }
  vis += '\n';
  let match = true;
  for (let y = 0; y < actual.height; ++y) {
    let markedE = '';
    let markedA = '';
    // lots of terminal escapes makes rendering slow, so try to aggregate
    let runE = '';
    let runA = '';
    let runM = false;
    for (let x = 0; x < actual.width + 1; ++x) {
      const e = expected.data[y][x];
      const a = actual.data[y][x];
      const m = e === '?' || a === e;
      if (!e || m !== runM) {
        if (runM) {
          markedE += runE;
          markedA += runA;
        } else {
          markedE += colInvert(runE);
          markedA += colInvert(runA);
        }
        runE = '';
        runA = '';
        runM = m;
      }
      runE += e;
      runA += a;
      if (e && !m) {
        match = false;
      }
    }
    markedE = makeVisible(markedE);
    markedA = makeVisible(markedA);
    vis += colExpected(markedE);
    if (stacked) {
      vis2 += colReceived(markedA);
      vis2 += '\n';
    } else {
      vis += pad + colReceived(markedA);
    }
    vis += '\n';
  }
  if (match) {
    return {
      pass: true,
      message: () =>
        `${msgPrefix}\n\n` +
        `Expected: not\n${colExpected(makeVisible(expectedImage))}\n` +
        `Received: matching image\n${colReceived(makeVisible(actualImage))}\n`,
    };
  }
  return { pass: false, message: () => `${msgPrefix}\n\n${vis}${vis2}\n` };
};
