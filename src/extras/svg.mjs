const SVG_NS = 'http://www.w3.org/2000/svg';
const UNSAFE = /[^-a-zA-Z0-9 .,:/#%()]/g;

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
      ([k, v]) => ` ${k}="${`${v}`.replace(UNSAFE, '')}"`,
    ),
    '>',
    ...children,
    `</${tag}>`,
  ].join('');

export const toSvgPath = (code) => {
  const anchors = new Map();
  const paths = [];
  const getAndDelete = (key) => {
    const v = anchors.get(key);
    anchors.delete(key);
    return v;
  };
  for (let y = 0; y <= code.size; ++y) {
    for (let x = 0; x <= code.size; ++x) {
      const v = code.get(x, y);
      const f = [
        code.get(x - 1, y) ^ v && x + ' ' + (y + 1),
        x + ' ' + y,
        code.get(x, y - 1) ^ v && x + 1 + ' ' + y,
      ].filter((v) => v);

      if (f.length > 1) {
        if (!v) {
          f.reverse();
        }

        const end = f.pop();
        const a = getAndDelete(f[0]) || [];
        const b = getAndDelete(end);
        a.push(...f);
        if (a === b) {
          paths.push(a);
        } else {
          if (b) {
            b.unshift(...a);
          } else {
            anchors.set(end, a);
          }
          anchors.set(a[0], b || a);
        }
      }
    }
  }

  return paths.map((p) => `M${p.join('L')}Z`).join('');
};

const toSvgInternal = (
  code,
  { on = 'black', off, padX = 4, padY = 4, width, height, scale = 1 },
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
