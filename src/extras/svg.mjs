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
  const anchors = [];
  let path = '';
  for (let y = 0; y <= code.size; ++y) {
    for (let x = 0; x <= code.size; ++x) {
      const v = code.get(x, y);
      const f1 = (x << 8) | y;
      let f0 = code.get(x - 1, y) ^ v && f1 + 1;
      let f2 = code.get(x, y - 1) ^ v && f1 + 256;

      if (f0 || f2) {
        if (!v) {
          [f0, f2] = [f2, f0];
        }

        const a = (anchors[f0 || f1] ||= []);
        const b = anchors[f2 || f1];
        f0 && a.push(f1);
        f2 && a.push(f2);
        if (a === b) {
          path += `M${a.map((v) => `${v >> 8} ${v & 0xff}`).join('L')}Z`;
        } else {
          b && a.push(...b);
          anchors[a[a.length - 1]] = a;
        }
      }
    }
  }
  return path;
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
