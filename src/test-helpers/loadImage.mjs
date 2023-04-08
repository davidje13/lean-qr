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
