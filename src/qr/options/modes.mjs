const alnum = (c) => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.indexOf(c);

const numeric = (value) => (data, version) => {
  data.push(0b0001, 4);
  data.push(value.length, version < 10 ? 10 : version < 27 ? 12 : 14);
  let i = 0;
  for (; i < value.length - 2; i += 3) {
    data.push(Number(value.substr(i, 3)), 10);
  }
  if (i < value.length - 1) {
    data.push(Number(value.substr(i, 2)), 7);
  } else if (i < value.length) {
    data.push(Number(value.substr(i, 1)), 4);
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

const iso88591 = (value) => (data, version) => {
  data.push(0b0100, 4);
  data.push(value.length, version < 10 ? 8 : 16);
  for (let i = 0; i < value.length; ++i) {
    // Unicode codepoints and ISO-8859-1 overlap for first 256 chars
    data.push(value.codePointAt(i), 8);
  }
};

const pickBest = (opts) => opts.reduce((best, part) => ((!best || part.e < best.e) ? part : best));

numeric.reg = /[0-9]/;
numeric.est = (value, version) => (
  4 + (version < 10 ? 10 : version < 27 ? 12 : 14) +
  (value.length * 10) / 3
);

alphaNumeric.reg = /[0-9A-Z $%*+./:-]/;
alphaNumeric.est = (value, version) => (
  4 + (version < 10 ? 9 : version < 27 ? 11 : 13) +
  value.length * 5.5
);

iso88591.reg = /[\u0000-\u00FF]/;
iso88591.est = (value, version) => (
  4 + (version < 10 ? 8 : 16) +
  value.length * 8
);

export default {
  auto: (value, { modes = [numeric, alphaNumeric, iso88591] } = {}) => (data, version) => {
    /*
     * The algorithm used here assumes that no mode can encode longer strings in less space.
     * It progresses character by character through the input string, tracking the single
     * lowest-cost-so-far path for each of the currently possible modes. It is possible
     * to determine this from the previous character's lowest-cost-so-far paths, making this
     * algorithm O(n * m^2) overall (n = characters in input, m = number of available modes),
     * assuming the mode estimator functions are O(1)
     */

    let ongoing = [{ c: 0, e: 0 }];
    [...value].forEach((ch, i) => {
      ongoing = modes.filter((c) => c.reg.test(ch)).map((c) => pickBest(ongoing.map((p) => {
        const part = { c, p: (p.c === c) ? p.p : p, s: (p.c === c) ? p.s : i };
        part.v = value.substring(part.s, i + 1);
        part.e = part.p.e + Math.ceil(c.est(part.v, version));
        return part;
      })));
      if (!ongoing.length) {
        throw new Error('Unencodable');
      }
    });
    const parts = [];
    for (let part = pickBest(ongoing); part.c; part = part.p) {
      parts.unshift(part.c(part.v));
    }
    parts.forEach((enc) => enc(data, version));
  },
  multi: (...encodings) => (data, version) => encodings.forEach((enc) => enc(data, version)),
  numeric,
  alphaNumeric,
  iso8859_1: iso88591,
};
