import { makeBitmap } from '../test-helpers/makeBitmap.mjs';
import { toPngBytes, toPngDataURL } from './png.mjs';
import { PNG } from 'pngjs';

describe('toPngBytes', () => {
  it('returns a valid PNG containing the code', async () => {
    const bitmap = makeBitmap(`
      ##-
      -#-
      ---
    `);

    const pngData = await toPngBytes(bitmap);

    const png = PNG.sync.read(Buffer.from(pngData));
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

  it('scales up the code', async () => {
    const bitmap = makeBitmap(`
      ##-
      -#-
      ---
    `);

    const pngData = await toPngBytes(bitmap, { scale: 3 });

    const png = PNG.sync.read(Buffer.from(pngData));
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

  it('uses custom on and off colours if given', async () => {
    const bitmap = makeBitmap(`
      ##-
      -#-
      ---
    `);

    const pngData = await toPngBytes(bitmap, {
      on: [10, 20, 30],
      off: [40, 50, 60],
    });

    const png = PNG.sync.read(Buffer.from(pngData));
    expect(png.width).equals(3 + 8);
    expect(png.height).equals(3 + 8);

    expect(getLine(png, 0, 0, 1)).equals([40, 50, 60, 255]);
    expect(getLine(png, 4, 4, 1)).equals([10, 20, 30, 255]);
    expect(getLine(png, 4, 5, 1)).equals([40, 50, 60, 255]);
  });
});

describe('toPngDataURL', () => {
  it('returns a PNG data URL', async () => {
    const url = await toPngDataURL(makeBitmap('#'));
    // the exact compression may vary, so we just check the non-compressed parts of the PNG format:
    expect(url).startsWith(
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJAQMAAADaX5RTAAAABlBMVEUAAAAAAAClZ7nPAAAA',
    );
  });
});

function getLine(png, x, y, n) {
  const p = (y * png.width + x) * 4;
  return [...png.data.subarray(p, p + n * 4)];
}
