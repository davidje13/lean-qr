import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { toPngBytes } from './png.mjs';

describe('toPngBytes', () => {
  it('returns a valid PNG', async () => {
    const pngData = await toPngBytes(Bitmap2D(1));
    expect(pngData[0]).toEqual(137);
  });
});
