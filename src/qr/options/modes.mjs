const alnum = (c) => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.indexOf(c);

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
  data.push(value.length, version < 10 ? 8 : 16);
  value.forEach((b) => data.push(b, 8));
};

const numeric = (value) => (data, version) => {
  data.push(0b0001, 4);
  data.push(value.length, version < 10 ? 10 : version < 27 ? 12 : 14);
  let i = 0;
  for (; i < value.length - 2; i += 3) {
    data.push(+value.slice(i, i + 3), 10);
  }
  if (i < value.length - 1) {
    data.push(+value.slice(i, i + 2), 7);
  } else if (i < value.length) {
    data.push(+value[i], 4);
  }
};

numeric.reg = /[0-9]/;
numeric.est = (value, version) =>
  4 + (version < 10 ? 10 : version < 27 ? 12 : 14) + (value.length * 10) / 3;

const alphaNumeric = (value) => (data, version) => {
  data.push(0b0010, 4);
  data.push(value.length, version < 10 ? 9 : version < 27 ? 11 : 13);
  let i = 0;
  for (; i < value.length - 1; i += 2) {
    data.push(alnum(value[i]) * 45 + alnum(value[i + 1]), 11);
  }
  if (i < value.length) {
    data.push(alnum(value[i]), 6);
  }
};

alphaNumeric.reg = /[0-9A-Z $%*+./:-]/;
alphaNumeric.est = (value, version) =>
  4 + (version < 10 ? 9 : version < 27 ? 11 : 13) + value.length * 5.5;

// Unicode codepoints and ISO-8859-1 overlap for first 256 chars
const ascii = (value) => bytes([...value].map((c) => c.codePointAt(0)));

ascii.reg = /[\u0000-\u007F]/;
ascii.est = (value, version) => 4 + (version < 10 ? 8 : 16) + value.length * 8;

const iso88591 = (value) => multi(eci(3), ascii(value));

iso88591.reg = /[\u0000-\u00FF]/;
iso88591.est = ascii.est;
iso88591.eci = 3;

const utf8Encoder = new TextEncoder();
const utf8 = (value) => multi(eci(26), bytes(utf8Encoder.encode(value)));

utf8.reg = /[^]/;
utf8.est = (value, version) =>
  4 + (version < 10 ? 8 : 16) + utf8Encoder.encode(value).length * 8;
utf8.eci = 26;

const pickBest = (opts) =>
  opts.reduce((best, part) => (part.e < best.e ? part : best));

export const DEFAULT_AUTO_MODES = [
  numeric,
  alphaNumeric,
  ascii,
  iso88591,
  utf8,
];

export default {
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
       */

      let cur = [{ e: 0 }];
      for (let i = 0; i < value.length; ++i) {
        cur = modes
          .filter((mode) => mode.reg.test(value[i]))
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
      multi(...parts)(data, version);
    },
  multi,
  eci,
  numeric,
  alphaNumeric,
  bytes,
  ascii,
  iso8859_1: iso88591,
  utf8,
};
