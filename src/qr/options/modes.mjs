const alnum = (c) => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.indexOf(c);

const multi =
  (...encodings) =>
  (data, version) =>
    encodings.forEach((enc) => enc(data, version));

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

const bytes = (value) => (data, version) => {
  data.push(0b0100, 4);
  data.push(value.length, version < 10 ? 8 : 16);
  value.forEach((b) => data.push(b, 8));
};

const eci = (id) => (data) => {
  data.push(0b0111, 4);
  data.push(id, 8);
};

// Unicode codepoints and ISO-8859-1 overlap for first 256 chars
const iso88591 = (value) => bytes([...value].map((c) => c.codePointAt(0)));

const utf8 = (value) => multi(eci(26), bytes(new TextEncoder().encode(value)));

const pickBest = (opts) =>
  opts.reduce((best, part) => (part.e < best.e ? part : best));

numeric.reg = /[0-9]/;
numeric.est = (value, version) =>
  4 + (version < 10 ? 10 : version < 27 ? 12 : 14) + (value.length * 10) / 3;

alphaNumeric.reg = /[0-9A-Z $%*+./:-]/;
alphaNumeric.est = (value, version) =>
  4 + (version < 10 ? 9 : version < 27 ? 11 : 13) + value.length * 5.5;

iso88591.reg = /[\u0000-\u00FF]/;
iso88591.est = (value, version) =>
  4 + (version < 10 ? 8 : 16) + value.length * 8;

export default {
  auto: (value, { modes = [numeric, alphaNumeric, iso88591, utf8] } = {}) => {
    // UTF8 is special; we cannot mix it with iso88591 since it sets a global flag.
    // detect it, remove it as an option, and only use it if there is no other way.
    const m = new Set(modes);
    const allowUTF8 = m.delete(utf8);
    if (allowUTF8) {
      modes = [...m];
    }

    return (data, version) => {
      /*
       * The algorithm used here assumes that no mode can encode longer strings in less space.
       * It progresses character by character through the input string, tracking the single
       * lowest-cost-so-far path for each of the currently possible modes. It is possible
       * to determine this from the previous character's lowest-cost-so-far paths, making this
       * algorithm O(n * m^2) overall (n = characters in input, m = number of available modes),
       * assuming the mode estimator functions are O(1)
       */

      let cur = [{ c: 0, e: 0 }];
      for (let i = 0; i < value.length; ++i) {
        cur = modes
          .filter((c) => c.reg.test(value[i]))
          .map((c) =>
            pickBest(
              cur.map((p) => {
                const part = {
                  c,
                  p: p.c === c ? p.p : p,
                  s: p.c === c ? p.s : i,
                };
                part.v = value.slice(part.s, i + 1);
                part.e = part.p.e + Math.ceil(c.est(part.v, version));
                return part;
              }),
            ),
          );
        if (!cur.length) {
          if (allowUTF8) {
            utf8(value)(data, version);
            return;
          }
          throw new Error('Unencodable');
        }
      }
      const parts = [];
      for (let part = pickBest(cur); part.c; part = part.p) {
        parts.unshift(part.c(part.v));
      }
      parts.forEach((enc) => enc(data, version));
    };
  },
  multi,
  eci,
  numeric,
  alphaNumeric,
  bytes,
  iso8859_1: iso88591,
  utf8,
};
