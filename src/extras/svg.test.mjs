import { toSvgPath, toSvgSource } from './svg.mjs';
import Bitmap2D from '../structures/Bitmap2D.mjs';

describe('toSvgPath', () => {
  it('identifies the outline around pixels', () => {
    const bitmap = new Bitmap2D({ size: 3 });
    bitmap.set(1, 1, true);

    expect(toSvgPath(bitmap)).toEqual('M1 2L1 1L2 1L2 2Z');
  });

  it('identifies outlines at the limits of the image', () => {
    const bitmap = new Bitmap2D({ size: 1 });
    bitmap.set(0, 0, true);

    expect(toSvgPath(bitmap)).toEqual('M0 1L0 0L1 0L1 1Z');
  });

  it('returns blank for a blank input', () => {
    const bitmap = new Bitmap2D({ size: 3 });

    expect(toSvgPath(bitmap)).toEqual('');
  });

  it('does not include lines between pixels in the same state', () => {
    const bitmap = new Bitmap2D({ size: 4 });
    bitmap.set(1, 1, true);
    bitmap.set(2, 1, true);
    bitmap.set(1, 2, true);
    bitmap.set(2, 2, true);

    expect(toSvgPath(bitmap)).toEqual('M2 3L1 3L1 2L1 1L2 1L3 1L3 2L3 3Z');
  });

  it('creates separate paths for unconnected regions', () => {
    const bitmap = new Bitmap2D({ size: 5 });
    bitmap.set(1, 1, true);
    bitmap.set(3, 2, true);

    expect(toSvgPath(bitmap)).toEqual('M1 2L1 1L2 1L2 2ZM3 3L3 2L4 2L4 3Z');
  });

  it('creates reversed paths for inner holes', () => {
    const bitmap = new Bitmap2D({ size: 5 });
    bitmap.set(1, 1, true);
    bitmap.set(2, 1, true);
    bitmap.set(3, 1, true);
    bitmap.set(1, 2, true);
    bitmap.set(3, 2, true);
    bitmap.set(1, 3, true);
    bitmap.set(2, 3, true);
    bitmap.set(3, 3, true);

    expect(toSvgPath(bitmap)).toEqual(
      'M3 3L3 2L2 2L2 3ZM3 4L2 4L1 4L1 3L1 2L1 1L2 1L3 1L4 1L4 2L4 3L4 4Z',
    );
  });
});

describe('toSvgSource', () => {
  it('generates full SVG source for an image', () => {
    const bitmap = new Bitmap2D({ size: 3 });
    bitmap.set(1, 1, true);

    expect(toSvgSource(bitmap)).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-4 -4 11 11" width="11" height="11"><path d="M1 2L1 1L2 1L2 2Z" fill="black"></path></svg>',
    );
  });

  it('adds a background rectangle if off colour is specified', () => {
    const bitmap = new Bitmap2D({ size: 3 });
    bitmap.set(1, 1, true);

    expect(toSvgSource(bitmap, { off: 'red' })).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-4 -4 11 11" width="11" height="11"><rect x="-4" y="-4" width="11" height="11" fill="red"></rect><path d="M1 2L1 1L2 1L2 2Z" fill="black"></path></svg>',
    );
  });
});
