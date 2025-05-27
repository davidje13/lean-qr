import { makeUint8Array, fail, ERROR_UNENCODABLE } from '../../util.mjs';

const alnum = (c) => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.indexOf(c);
const firstCharCode = (c) => c.charCodeAt(0);

export const multi =
  (...encodings) =>
  (data, version) =>
    encodings.forEach((enc) => enc(data, version));

export const eci = (id) => (data) => {
  if (data.eci !== id) {
    data.push(0b0111, 4);
    data.push(id, 8);
    data.eci = id;
  }
};

export const bytes = (value) => (data, version) => {
  data.push(0b0100, 4);
  data.push(value.length, 8 + (version > 9) * 8);
  value.forEach((b) => data.push(b, 8));
};

const makeMode = (
  fn,
  test,
  estimatorLen,
  requiredECI,
  estimator = (value, version) => estimatorLen(value.length, version),
  wrappedFn = requiredECI ? (value) => multi(eci(requiredECI), fn(value)) : fn,
) => {
  wrappedFn.test = test;
  wrappedFn._estimateByLength = estimatorLen;
  wrappedFn.est = estimator;
  wrappedFn.eci = requiredECI && [requiredECI];
  return wrappedFn;
};

export const numeric = makeMode(
  (value) => (data, version) => {
    data.push(0b0001, 4);
    data.push(value.length, 10 + (version > 26) * 2 + (version > 9) * 2);
    let i = 0;
    for (; i < value.length - 2; i += 3) {
      data.push(+value.slice(i, i + 3), 10);
    }
    if (i < value.length - 1) {
      data.push(+value.slice(i), 7);
    } else if (i < value.length) {
      data.push(+value[i], 4);
    }
  },
  (x) => /[0-9]/.test(x),
  (count, version) =>
    14 + (version > 26) * 2 + (version > 9) * 2 + (count * 10) / 3,
);

export const alphaNumeric = makeMode(
  (value) => (data, version) => {
    data.push(0b0010, 4);
    data.push(value.length, 9 + (version > 26) * 2 + (version > 9) * 2);
    let i = 0;
    for (; i < value.length - 1; i += 2) {
      data.push(alnum(value[i]) * 45 + alnum(value[i + 1]), 11);
    }
    if (i < value.length) {
      data.push(alnum(value[i]), 6);
    }
  },
  (c) => alnum(c) >= 0,
  (count, version) => 13 + (version > 26) * 2 + (version > 9) * 2 + count * 5.5,
);

// Unicode codepoints and ISO-8859-1 overlap for first 256 chars
export const ascii = makeMode(
  (value) => bytes([...value].map(firstCharCode)),
  (c) => firstCharCode(c) < 0x80,
  (count, version) => 12 + (version > 9) * 8 + count * 8,
);
ascii._composable = true;
ascii._skipIfECI = true; // bespoke optimisation: ascii is never better if ECI has already been set

export const iso8859_1 = makeMode(
  ascii,
  (c) => firstCharCode(c) < 0x100,
  ascii._estimateByLength,
  3,
);
iso8859_1._composable = true;

const utf8Encoder = new TextEncoder();
export const utf8 = makeMode(
  (value) => bytes(utf8Encoder.encode(value)),
  () => 1,
  0,
  26,
  (value, version) =>
    12 + (version > 9) * 8 + utf8Encoder.encode(value).length * 8,
);
utf8._composable = true;

let shiftJISMap = () => {
  const map = new Map();
  const decoder = new TextDecoder('sjis');
  const b = makeUint8Array(2);
  for (let code = 0; code < 0x1f25; ++code) {
    b[0] = code / 0xc0 + 0x81 + (code > 0x173f) * 0x40;
    b[1] = (code % 0xc0) + 0x40;
    map.set(decoder.decode(b), code);
  }
  map.delete('\uFFFD');
  shiftJISMap = () => map;
  return map;
};

export const shift_jis = makeMode(
  (value) => (data, version) => {
    data.push(0b1000, 4);
    data.push(value.length, 8 + (version > 26) * 2 + (version > 9) * 2);
    for (const c of value) {
      data.push(shiftJISMap().get(c), 13);
    }
  },
  (c) => shiftJISMap().has(c),
  (count, version) => 12 + (version > 26) * 2 + (version > 9) * 2 + count * 13,
);
shift_jis._composable = true;

export const auto =
  (
    value,
    { modes = [numeric, alphaNumeric, ascii, iso8859_1, shift_jis, utf8] } = {},
  ) =>
  (data, version) => {
    /*
     * The algorithm used here assumes that no mode can encode longer strings in less space,
     * and that it is only beneficial to switch modes when the supported character sets
     * change.
     *
     * It breaks the string into chunks according to which combination of modes can encode
     * the characters, then progresses block by block, tracking the single lowest-cost-so-far
     * path for each of the currently possible mode/eci combinations. It is possible to
     * determine this from the previous character's lowest-cost-so-far paths, making this
     * algorithm O(n * m^2) overall (n = number of blocks, m = number of available modes *
     * possible ECI states), assuming the mode estimator functions are O(1)
     *
     * Since this is the most CPU-intensive part of the process, it has been optimised for
     * speed rather than code size.
     */

    const scopedModes = modes.map((mode, i) => {
      const cache = new Map();
      const calcCached = (k, fn) => {
        if (!cache.has(k)) {
          cache.set(k, fn(k, version));
        }
        return cache.get(k);
      };
      return {
        _base: mode,
        _id: 1 << i,
        _switchCost: mode.est('', version),
        _est: mode._estimateByLength
          ? (start, end) => calcCached(end - start, mode._estimateByLength)
          : (start, end) => calcCached(value.slice(start, end), mode.est),
      };
    });

    let cur = [{ _cost: 0 }];
    let start = 0;
    let end = 0;
    let prevActive = -1;
    for (const c of [...value, '']) {
      let active = 0;
      if (c) {
        for (const mode of scopedModes) {
          if (mode._base.test(c)) {
            active |= mode._id;
          }
        }
      }
      if (!c || active !== prevActive) {
        if (prevActive !== -1) {
          const ecis = new Set(cur.map((p) => p._eci));
          const next = [];
          for (const { _base, _switchCost, _est, _id } of scopedModes) {
            if (prevActive & _id) {
              const fragCost = _est(start, end);
              for (const eci of _base.eci ?? ecis) {
                if (!_base._skipIfECI || !eci) {
                  let best;
                  for (const p of cur) {
                    if (p._eci === eci || _base.eci) {
                      const join = p._base === _base && p._eci === eci;
                      const prev = join ? p._prev : p;

                      const cost =
                        _base._composable && join
                          ? p._cost + fragCost - _switchCost
                          : prev._cost +
                            (prev._eci !== eci) * 12 + // cost of switching ECI
                            (join
                              ? _est(join ? p._start : start, end)
                              : fragCost);
                      if (!best || cost < best._cost) {
                        best = {
                          _start: join ? p._start : start,
                          _prev: prev,
                          _base: _base,
                          _eci: eci,
                          _end: end,
                          _cost: cost,
                        };
                      }
                    }
                  }
                  if (best) {
                    next.push(best);
                  }
                }
              }
            }
          }
          cur = next;
        }
        prevActive = active;
        start = end;
      }
      end += c.length;
    }
    if (!cur.length) {
      fail(ERROR_UNENCODABLE);
    }

    const parts = [];
    for (
      let part = cur.reduce((a, b) => (b._cost < a._cost ? b : a));
      part._base;
      part = part._prev
    ) {
      parts.push(part._base(value.slice(part._start, part._end)));
    }
    parts.reverse().forEach((enc) => enc(data, version));
  };
