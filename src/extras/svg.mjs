const SVG_NS = 'http://www.w3.org/2000/svg';

const make = (
  d,
  tag,
  attrs,
  children = [],
  o = d.createElementNS(SVG_NS, tag),
) => {
  Object.entries(attrs).map(([k, v]) => o.setAttribute(k, v));
  o.replaceChildren(...children);
  return o;
};

const makeSrc = (_, tag, attrs, children = []) =>
  [
    `<${tag}`,
    ...Object.entries(attrs).map(
      ([k, v]) => ` ${k}="${`${v}`.replace(/[^ -~]|["&]/g, '')}"`,
    ),
    '>',
    ...children,
    `</${tag}>`,
  ].join('');

export const toSvgPath = (code) => {
  const size = code.size;
  const pointsPerRow = size + 1;

  /**
   * bit 0-3: store the heading direction
   * bit 4 and above: group ID
   */
  const points = new Uint32Array(pointsPerRow * pointsPerRow);

  /**
   * key: group ID
   * value: index of points
   */
  const startIndices = new Map();

  /**
   * store closed contours
   */
  const contours = [];

  const DIR_UP = 1;
  const DIR_RIGHT = 2;
  const DIR_DOWN = 4;
  const DIR_LEFT = 8;

  const DIR_OFFSET = [];
  DIR_OFFSET[DIR_UP] = -pointsPerRow;
  DIR_OFFSET[DIR_RIGHT] = 1;
  DIR_OFFSET[DIR_DOWN] = pointsPerRow;
  DIR_OFFSET[DIR_LEFT] = -1;

  let groupId = 0;

  const saveContour = (startIdx) => {
    const contour = [startIdx];
    let d = 0, i;
    for (i = 0; i < 4; ++i) {
      if (points[startIdx] & (1 << i)) {
        d = 1 << i;
        break;
      }
    }
    if (i === 4) {
      throw 'No available direction';
    }
    let p = startIdx + DIR_OFFSET[d];
    contour.push(p);
    while (1) {
      for (i = 0; i < 4; ++i) {
        if (points[p] & d) {
          break;
        }
        d = d === 8 ? 1 : (d << 1);
      }
      if (i === 4) {
        throw 'No available direction';
      }
      p += DIR_OFFSET[d];
      if (p === startIdx) {
        break;
      }
      if (i === 0) {
        contour[contour.length - 1] = p;
      } else {
        contour.push(p);
      }
    }

    const p0 = contour[0];
    const p1 = contour[1];
    const p2 = contour[contour.length - 1];
    const crossProduct = (p1 % pointsPerRow - p0 % pointsPerRow) * ((p2 / pointsPerRow >>> 0) - (p0 / pointsPerRow >>> 0)) - ((p1 / pointsPerRow >>> 0) - (p0 / pointsPerRow >>> 0)) * (p2 % pointsPerRow - p0 % pointsPerRow);
    if (crossProduct === 0) {
      contour[0] = p2;
      --contour.length;
    }
    contours.push(contour);
  }

  const addPath = (x, y, direction) => {
    const p0 = x + y * pointsPerRow;
    const p1 = p0 + DIR_OFFSET[direction];
    const g0 = points[p0] >>> 4;
    const g1 = points[p1] >>> 4;
    points[p0] |= direction;

    if (g0 && g1) {
      if (g0 === g1) {
        // Found a closed path
        points[p0] &= 0xf;
        points[p1] &= 0xf;
        saveContour(startIndices.get(g0));
        startIndices.delete(g0);
      } else {
        // Merge groups
        const pHead = startIndices.get(g0);
        points[p0] &= 0xf;
        points[p1] &= 0xf;
        points[pHead] = g1 << 4 | points[pHead] & 0xf;
        startIndices.set(g1, pHead);
        startIndices.delete(g0);
      }
    } else if (!(g0 | g1)) {
      // Create a new group
      const gid = ++groupId;
      points[p0] = gid << 4 | points[p0] & 0xf;
      points[p1] = gid << 4 | points[p1] & 0xf;
      startIndices.set(gid, p0);
    } else if (g0) {
      points[p0] &= 0xf;
      points[p1] = g0 << 4 | points[p1] & 0xf;
    } else {
      points[p1] &= 0xf;
      points[p0] = g1 << 4 | points[p0] & 0xf;
      startIndices.set(g1, p0);
    }
  }

  for (let y = 0; y < size; ++y) {
    for (let x = 0; x < size; ++x) {
      if (code.get(x, y)) {
        if (x - 1 < 0 || !code.get(x - 1, y)) {
          addPath(x, y + 1, DIR_UP);
        }
        if (y - 1 < 0 || !code.get(x, y - 1)) {
          addPath(x, y, DIR_RIGHT);
        }
        if (x + 1 >= size || !code.get(x + 1, y)) {
          addPath(x + 1, y, DIR_DOWN);
        }
        if (y + 1 >= size || !code.get(x, y + 1)) {
          addPath(x + 1, y + 1, DIR_LEFT);
        }
      }
    }
  }

  return contours.map(path => `M${path.map(p => `${p % pointsPerRow} ${p / pointsPerRow >>> 0}`).join('L')}Z`).join('');
};

const toSvgInternal = (
  code,
  {
    on = 'black',
    off,
    pad = 4,
    padX = pad,
    padY = pad,
    width,
    height,
    scale = 1,
  },
  mk,
  makeParam0,
  target,
) => {
  const w = code.size + padX * 2;
  const h = code.size + padY * 2;
  return mk(
    makeParam0,
    'svg',
    {
      xmlns: SVG_NS,
      version: '1.1',
      viewBox: `${-padX} ${-padY} ${w} ${h}`,
      width: width ?? w * scale,
      height: height ?? h * scale,
      'shape-rendering': 'crispedges',
    },
    [
      off
        ? mk(makeParam0, 'rect', {
            x: -padX,
            y: -padY,
            width: w,
            height: h,
            fill: off,
          })
        : '',
      mk(makeParam0, 'path', { d: toSvgPath(code), fill: on }),
    ],
    target,
  );
};

export const toSvg = (code, svg, options = {}) =>
  svg.body
    ? toSvgInternal(code, options, make, svg)
    : toSvgInternal(code, options, make, svg.ownerDocument, svg);

export const toSvgSource = (code, options = {}) =>
  (options.xmlDeclaration ? '<?xml version="1.0" encoding="UTF-8" ?>' : '') +
  toSvgInternal(code, options, makeSrc);

export const toSvgDataURL = (code, options) =>
  'data:image/svg+xml;base64,' +
  btoa(toSvgSource(code, { xmlDeclaration: 1, ...options }));
