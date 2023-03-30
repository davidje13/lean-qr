const SVG_NS = 'http://www.w3.org/2000/svg';
const UNSAFE = /[^-a-zA-Z0-9 .,:/#%()]/g;

const make = (
  d,
  tag,
  attrs,
  children = [],
  o = d.createElementNS(SVG_NS, tag),
) => {
  Object.entries(attrs).forEach(([k, v]) => o.setAttribute(k, v));
  o.replaceChildren(...children);
  return o;
};

const makeSrc = (tag, attrs, children = []) =>
  [
    `<${tag}`,
    ...Object.entries(attrs).map(
      ([k, v]) => ` ${k}="${`${v}`.replaceAll(UNSAFE, '')}"`,
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
      const v5 = code.get(x, y);
      const v2 = code.get(x, y - 1);
      const v4 = code.get(x - 1, y);
      const f = [
        v4 !== v5 && x + ' ' + (y + 1),
        x + ' ' + y,
        v2 !== v5 && x + 1 + ' ' + y,
      ].filter((v) => v);

      if (f.length > 1) {
        if (!v5) {
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
  target,
) => {
  const w = code.size + padX * 2;
  const h = code.size + padY * 2;
  return mk(
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
        ? mk('rect', {
            x: -padX,
            y: -padY,
            width: w,
            height: h,
            fill: off,
          })
        : '',
      mk('path', { d: toSvgPath(code), fill: on }),
    ],
    target,
  );
};

export const toSvg = (code, svg, options = {}) =>
  svg.body
    ? toSvgInternal(code, options, make.bind(0, svg))
    : toSvgInternal(code, options, make.bind(0, svg.ownerDocument), svg);

export const toSvgSource = (code, options = {}) =>
  (options.xmlDeclaration ? '<?xml version="1.0" encoding="UTF-8" ?>' : '') +
  toSvgInternal(code, options, makeSrc);

export const toSvgDataURL = (code, options) =>
  'data:image/svg+xml;base64,' +
  btoa(toSvgSource(code, { xmlDeclaration: 1, ...options }));
