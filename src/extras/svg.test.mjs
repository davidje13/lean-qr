import { toSvgPath, toSvgSource, toSvgDataURL } from './svg.mjs';
import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { makeBitmap } from '../test-helpers/makeBitmap.mjs';

const BASIC_IMAGE = makeBitmap(`
  ---
  -#-
  ---
`);

describe('toSvgPath', () => {
  it('identifies the outline around pixels', () => {
    expect(toSvgPath(BASIC_IMAGE)).toEqual('M1 2L1 1L2 1L2 2Z');
  });

  it('identifies outlines at the limits of the image', () => {
    const bitmap = makeBitmap(`
      #
    `);

    expect(toSvgPath(bitmap)).toEqual('M0 1L0 0L1 0L1 1Z');
  });

  it('returns blank for a blank input', () => {
    const bitmap = Bitmap2D(3);

    expect(toSvgPath(bitmap)).toEqual('');
  });

  it('does not include lines between pixels in the same state', () => {
    const bitmap = makeBitmap(`
      ----
      -##-
      -##-
      ----
    `);

    expect(toSvgPath(bitmap)).toEqual('M2 3L1 3L1 2L1 1L2 1L3 1L3 2L3 3Z');
  });

  it('creates separate paths for unconnected regions', () => {
    const bitmap = makeBitmap(`
      -----
      -#---
      ---#-
      -----
      -----
    `);

    expect(toSvgPath(bitmap)).toEqual('M1 2L1 1L2 1L2 2ZM3 3L3 2L4 2L4 3Z');
  });

  it('creates reversed paths for inner holes', () => {
    const bitmap = makeBitmap(`
      -----
      -###-
      -#-#-
      -###-
      -----
    `);

    expect(toSvgPath(bitmap)).toEqual(
      'M3 3L3 2L2 2L2 3ZM3 4L2 4L1 4L1 3L1 2L1 1L2 1L3 1L4 1L4 2L4 3L4 4Z',
    );
  });
});

describe('toSvgSource', () => {
  it('generates full SVG source for an image', () => {
    expect(toSvgSource(BASIC_IMAGE)).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-4 -4 11 11" width="11" height="11" shape-rendering="crispedges"><path d="M1 2L1 1L2 1L2 2Z" fill="black"></path></svg>',
    );
  });

  it('adds a background rectangle if off colour is specified', () => {
    expect(toSvgSource(BASIC_IMAGE, { off: 'red' })).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-4 -4 11 11" width="11" height="11" shape-rendering="crispedges"><rect x="-4" y="-4" width="11" height="11" fill="red"></rect><path d="M1 2L1 1L2 1L2 2Z" fill="black"></path></svg>',
    );
  });

  it('blocks unsafe characters', () => {
    const src = toSvgSource(BASIC_IMAGE, {
      off: '"no" \x00bad\n & \tchars\u2026',
    });
    const fill = /fill=[^>]*/.exec(src);
    expect(fill[0]).toEqual('fill="no bad  chars"');
  });

  it('can include XML declaration', () => {
    const bitmap = Bitmap2D(1);

    const source = toSvgSource(bitmap, {
      xmlDeclaration: true,
      padX: 0,
      padY: 0,
    });

    expect(source).toEqual(
      '<?xml version="1.0" encoding="UTF-8" ?><svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1 1" width="1" height="1" shape-rendering="crispedges"><path d="" fill="black"></path></svg>',
    );
  });
});

describe('toSvgDataURL', () => {
  it('generates a data:image/svg+xml URL for the code', () => {
    const data = toSvgDataURL(BASIC_IMAGE);
    const [type, content] = data.split(';');

    expect(type).toEqual('data:image/svg+xml');
    expect(content).toEqual(
      'base64,' +
        'PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiID8+PHN2ZyB4bWxu' +
        'cz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZlcnNpb249IjEuMSIgdmll' +
        'd0JveD0iLTQgLTQgMTEgMTEiIHdpZHRoPSIxMSIgaGVpZ2h0PSIxMSIgc2hhcGUt' +
        'cmVuZGVyaW5nPSJjcmlzcGVkZ2VzIj48cGF0aCBkPSJNMSAyTDEgMUwyIDFMMiAy' +
        'WiIgZmlsbD0iYmxhY2siPjwvcGF0aD48L3N2Zz4=',
    );
  });
});
