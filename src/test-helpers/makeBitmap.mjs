import { Bitmap2D } from '../structures/Bitmap2D.mjs';

export function makeBitmap(lines) {
  if (typeof lines === 'string') {
    lines = lines
      .trim()
      .split('\n')
      .map((ln) => ln.trim());
  }

  const bmp = Bitmap2D(lines.length);
  lines.forEach((line, y) => {
    for (let x = 0; x < line.length; ++x) {
      const c = line[x];
      bmp._data[y * bmp.size + x] = c === '#';
    }
  });
  return bmp;
}
