import { makeUint8Array, fail, ERROR_UNENCODABLE } from '../../util.mjs';

const alnum = (c) => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.indexOf(c);
const firstCharCode = (c) => c.charCodeAt(0);

const multi =
  (...encodings) =>
  (data, version) =>
    encodings.forEach((enc) => enc(data, version));

const eci = (id) => (data) => {
  if (data.eci !== id) {
    data.push(0b0111, 4);
    data.push(id, 8);
    data.eci = id;
  }
};

const bytes = (value) => (data, version) => {
  data.push(0b0100, 4);
  data.push(value.length, 8 + (version > 9) * 8);
  value.forEach((b) => data.push(b, 8));
};

const makeMode = (
  fn,
  test,
  estimator,
  requiredECI,
  wrappedFn = requiredECI ? (value) => multi(eci(requiredECI), fn(value)) : fn,
) => {
  wrappedFn.test = test;
  wrappedFn.est = estimator;
  wrappedFn.eci = requiredECI;
  return wrappedFn;
};

const numeric = makeMode(
  (value) => (data, version) => {
    data.push(0b0001, 4);
    data.push(value.length, 10 + (version > 26) * 2 + (version > 9) * 2);
    let i = 0;
    for (; i < value.length - 2; i += 3) {
      data.push(+value.slice(i, i + 3), 10);
    }
    if (i < value.length - 1) {
      data.push(+value.slice(i, i + 2), 7);
    } else if (i < value.length) {
      data.push(+value[i], 4);
    }
  },
  /./.test.bind(/[0-9]/),
  (value, version) =>
    14 + (version > 26) * 2 + (version > 9) * 2 + (value.length * 10) / 3,
);

const alphaNumeric = makeMode(
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
  (value, version) =>
    13 + (version > 26) * 2 + (version > 9) * 2 + value.length * 5.5,
);

// Unicode codepoints and ISO-8859-1 overlap for first 256 chars
const ascii = makeMode(
  (value) => bytes([...value].map(firstCharCode)),
  (c) => firstCharCode(c) < 0x80,
  (value, version) => 12 + (version > 9) * 8 + value.length * 8,
);

const iso8859_1 = makeMode(
  ascii,
  (c) => firstCharCode(c) < 0x100,
  ascii.est,
  3,
);

const utf8Encoder = new TextEncoder();
const utf8 = makeMode(
  (value) => bytes(utf8Encoder.encode(value)),
  () => 1,
  (value, version) =>
    12 + (version > 9) * 8 + utf8Encoder.encode(value).length * 8,
  26,
);

let shiftJISMap = () => {
  const map = new Map();
  const decoder = new TextDecoder('sjis');
  const b = makeUint8Array(2);
  for (let code = 0; code < 0x1f25; ++code) {
    b[0] = code / 0xc0 + 0x81 + (code >= 0x1740) * 0x40;
    b[1] = (code % 0xc0) + 0x40;
    map.set(decoder.decode(b), code);
  }
  map.delete('\uFFFD');
  shiftJISMap = () => map;
  return map;
};

const shift_jis = makeMode(
  (value) => (data, version) => {
    data.push(0b1000, 4);
    data.push(value.length, 8 + (version > 26) * 2 + (version > 9) * 2);
    for (const c of value) {
      data.push(shiftJISMap().get(c), 13);
    }
  },
  (c) => shiftJISMap().has(c),
  (value, version) =>
    12 + (version > 26) * 2 + (version > 9) * 2 + value.length * 13,
);

const pickBest = (opts) =>
  opts.reduce((best, part) => (part._cost < best._cost ? part : best));

export const DEFAULT_AUTO_MODES = [
  numeric,
  alphaNumeric,
  ascii,
  iso8859_1,
  shift_jis,
  utf8,
];

export const mode = {
  auto:
    (value, { modes = DEFAULT_AUTO_MODES } = {}) =>
    (data, version) => {
      /*
       * The algorithm used here assumes that no mode can encode longer strings in less space.
       * It progresses character by character through the input string, tracking the single
       * lowest-cost-so-far path for each of the currently possible modes. It is possible
       * to determine this from the previous character's lowest-cost-so-far paths, making this
       * algorithm O(n * m^2) overall (n = characters in input, m = number of available modes),
       * assuming the mode estimator functions are O(1)
       *
       * This is not perfect, as it does not keep track of all possible ECI modes the state
       * could have (so may choose e.g. 'iso8859 / numeric / utf8' over 'utf8 / numeric / utf8'
       * even if the latter is better)
       */

      let cur = [{ _cost: 0 }];
      for (let i = 0; i < value.length; ++i) {
        cur = modes
          .filter((mode) => mode.test(value[i]))
          .map((mode) =>
            pickBest(
              cur.map((p) => {
                const start = p._mode === mode ? p._start : i;
                const previous = p._mode === mode ? p._previous : p;
                const fragment = value.slice(start, i + 1);
                const curECI = mode.eci ?? previous._eci;
                return {
                  _mode: mode,
                  _previous: previous,
                  _start: start,
                  _text: fragment,
                  _cost:
                    previous._cost +
                    (curECI !== previous.i) * 12 +
                    Math.ceil(mode.est(fragment, version)),
                  _eci: curECI,
                };
              }),
            ),
          );
        if (!cur.length) {
          fail(ERROR_UNENCODABLE);
        }
      }
      const parts = [];
      for (let part = pickBest(cur); part._mode; part = part._previous) {
        parts.unshift(part._mode(part._text));
      }
      parts.forEach((enc) => enc(data, version));
    },
  multi,
  eci,
  numeric,
  alphaNumeric,
  bytes,
  ascii,
  iso8859_1,
  shift_jis,
  utf8,
};
