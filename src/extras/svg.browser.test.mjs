import { toSvg } from './svg.mjs';
import { makeBitmap } from '../test-helpers/makeBitmap.mjs';

const BASIC_IMAGE = makeBitmap(`
  ---
  -#-
  ---
`);

describe('toSvg', () => {
  it('creates an SVG element in the DOM', () => {
    const svg = toSvg(BASIC_IMAGE, document);
    expect(svg).toBeInstanceOf(SVGSVGElement);
    expect(svg.outerHTML).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-4 -4 11 11" width="11" height="11" shape-rendering="crispedges"><path d="M1 2L1 1L2 1L2 2Z" fill="black"></path></svg>',
    );
  });

  it('populates an existing SVG element', () => {
    const base = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const svg = toSvg(BASIC_IMAGE, base);
    expect(svg).toBe(base);
    expect(base.outerHTML).toEqual(
      '<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="-4 -4 11 11" width="11" height="11" shape-rendering="crispedges"><path d="M1 2L1 1L2 1L2 2Z" fill="black"></path></svg>',
    );
  });
});
