import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { toPngBytes, toPngDataURL } from './png.mjs';

describe('toPngBytes', () => {
  it('returns a valid PNG', async () => {
    const pngData = await toPngBytes(Bitmap2D(1));
    expect(pngData[0]).toEqual(137);
  });
});

describe('toPngDataURL', () => {
  it('returns a data URL which can be passed to img src', async () => {
    const url = await toPngDataURL(Bitmap2D(10), { pad: 2 });
    const img = await loadImage(url);
    expect(img.width).toEqual(14);
    expect(img.height).toEqual(14);
  });

  it('applies requested scaling', async () => {
    const url = await toPngDataURL(Bitmap2D(10), { pad: 2, scale: 3 });
    const img = await loadImage(url);
    expect(img.width).toEqual(42);
    expect(img.height).toEqual(42);
  });
});

async function loadImage(src) {
  const img = document.createElement('img');
  await new Promise((resolve, reject) => {
    img.addEventListener('load', resolve, { once: true });
    img.addEventListener('error', reject, { once: true });
    img.src = src;
  });
  return img;
}
