const SVG_NS = 'http://www.w3.org/2000/svg';
const UNSAFE = /[^-a-zA-Z0-9 .:/#%]/g;

const make = (d, tag, attrs, children = [], existing) => {
  const o = existing || d.createElementNS(SVG_NS, tag);
  Object.entries(attrs).forEach(([k, v]) => o.setAttribute(k, v));
  o.replaceChildren(...children);
  return o;
};

const makeSrc = (tag, attrs, children = []) =>
  [
    `<${tag}`,
    ...Object.entries(attrs).map(
      ([k, v]) => ` ${k}="${String(v).replaceAll(UNSAFE, '')}"`,
    ),
    '>',
    ...children,
    `</${tag}>`,
  ].join('');

const getAndDelete = (map, key) => {
  const v = map.get(key);
  map.delete(key);
  return v;
};

export const toSvgPath = (code) => {
  const s = code.size;
  const get = (x, y) => x >= 0 && x < s && y >= 0 && y < s && code.get(x, y);

  const anchors = new Map();
  const paths = [];
  for (let y = 0; y <= s; ++y) {
    for (let x = 0; x <= s; ++x) {
      const v5 = get(x, y);
      const v2 = get(x, y - 1);
      const v4 = get(x - 1, y);
      if (v5 === v2 && v5 === v4) {
        continue;
      }

      const f = [
        v4 !== v5 && x + ' ' + (y + 1),
        x + ' ' + y,
        v2 !== v5 && x + 1 + ' ' + y,
      ].filter((v) => v);
      if (!v5) {
        f.reverse();
      }

      const end = f.pop();
      const a = getAndDelete(anchors, f[0]) || [];
      const b = getAndDelete(anchors, end);
      a.push(...f);
      if (a === b) {
        paths.push(a);
        continue;
      }
      if (b) {
        b.unshift(...a);
      } else {
        anchors.set(end, a);
      }
      anchors.set(a[0], b || a);
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
    ? toSvgInternal(code, options, make.bind(null, svg))
    : toSvgInternal(code, options, make.bind(null, svg.ownerDocument), svg);

export const toSvgSource = (code, options = {}) =>
  toSvgInternal(code, options, makeSrc);
