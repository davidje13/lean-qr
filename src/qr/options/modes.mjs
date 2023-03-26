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

const makeMode = (fn, test, estimator, requiredECI) => {
  const wrappedFn = requiredECI
    ? (value) => multi(eci(requiredECI), fn(value))
    : fn;
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

const pickBest = (opts) =>
  opts.reduce((best, part) => (part.e < best.e ? part : best));

export const DEFAULT_AUTO_MODES = [
  numeric,
  alphaNumeric,
  ascii,
  iso8859_1,
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

      let cur = [{ e: 0 }];
      for (let i = 0; i < value.length; ++i) {
        cur = modes
          .filter((mode) => mode.test(value[i]))
          .map((mode) =>
            pickBest(
              cur.map((p) => {
                const start = p.m === mode ? p.s : i;
                const previous = p.m === mode ? p.p : p;
                const fragment = value.slice(start, i + 1);
                const curECI = mode.eci ?? previous.i;
                return {
                  m: mode,
                  p: previous,
                  s: start,
                  v: fragment,
                  e:
                    previous.e +
                    (curECI !== previous.i) * 12 +
                    Math.ceil(mode.est(fragment, version)),
                  i: curECI,
                };
              }),
            ),
          );
        if (!cur.length) {
          throw new Error('Unencodable');
        }
      }
      const parts = [];
      for (let part = pickBest(cur); part.m; part = part.p) {
        parts.unshift(part.m(part.v));
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
  utf8,
};
