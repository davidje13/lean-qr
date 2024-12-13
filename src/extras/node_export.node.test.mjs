import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { toPngBuffer } from './node_export.mjs';
import { PNG } from 'pngjs';

describe('toPngBuffer', () => {
  it('returns a valid PNG containing the code', () => {
    const bitmap = Bitmap2D(3);
    bitmap._set(0, 0, true);
    bitmap._set(1, 0, true);
    bitmap._set(1, 1, true);

    const pngData = toPngBuffer(bitmap);

    const png = PNG.sync.read(pngData);
    expect(png.width).equals(3 + 8);
    expect(png.height).equals(3 + 8);

    expect(getLine(png, 0, 0, 1)).equals([0, 0, 0, 0]);
    expect(getLine(png, 3, 4, 1)).equals([0, 0, 0, 0]);
    expect(getLine(png, 4, 3, 1)).equals([0, 0, 0, 0]);
    expect(getLine(png, 4, 4, 3)).equals([
      0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 0,
    ]);
    expect(getLine(png, 4, 5, 3)).equals([
      0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 0,
    ]);
    expect(getLine(png, 4, 6, 3)).equals([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('scales up the code', () => {
    const bitmap = Bitmap2D(3);
    bitmap._set(0, 0, true);
    bitmap._set(1, 0, true);
    bitmap._set(1, 1, true);

    const pngData = toPngBuffer(bitmap, { scale: 3 });

    const png = PNG.sync.read(pngData);
    expect(png.width).equals((3 + 8) * 3);
    expect(png.height).equals((3 + 8) * 3);

    expect(getLine(png, 0, 0, 1)).equals([0, 0, 0, 0]);
    expect(getLine(png, 4 * 3 - 1, 4 * 3, 1)).equals([0, 0, 0, 0]);
    expect(getLine(png, 4 * 3, 4 * 3 - 1, 1)).equals([0, 0, 0, 0]);
    expect(getLine(png, 4 * 3, 4 * 3, 9)).equals([
      0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0,
      0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    expect(getLine(png, 4 * 3, 4 * 3 + 1, 9)).equals([
      0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0, 255, 0,
      0, 0, 255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
    expect(getLine(png, 4 * 3, 5 * 3, 9)).equals([
      0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 255, 0, 0, 0, 255, 0, 0, 0,
      255, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    ]);
  });

  it('uses custom on and off colours if given', () => {
    const bitmap = Bitmap2D(3);
    bitmap._set(0, 0, true);
    bitmap._set(1, 0, true);
    bitmap._set(1, 1, true);

    const pngData = toPngBuffer(bitmap, {
      on: [10, 20, 30],
      off: [40, 50, 60],
    });

    const png = PNG.sync.read(pngData);
    expect(png.width).equals(3 + 8);
    expect(png.height).equals(3 + 8);

    expect(getLine(png, 0, 0, 1)).equals([40, 50, 60, 255]);
    expect(getLine(png, 4, 4, 1)).equals([10, 20, 30, 255]);
    expect(getLine(png, 4, 5, 1)).equals([40, 50, 60, 255]);
  });
});

function getLine(png, x, y, n) {
  const p = (y * png.width + x) * 4;
  return [...png.data.subarray(p, p + n * 4)];
}
