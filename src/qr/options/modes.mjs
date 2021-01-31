const alnum = (c) => '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:'.indexOf(c);

export default {
  multi: (...encodings) => (data, version) => encodings.forEach((enc) => enc(data, version)),

  numeric: (value) => (data, version) => {
    data.addInt(0b0001, 4);
    data.addInt(value.length, version < 10 ? 10 : version < 27 ? 12 : 14);
    let i = 0;
    for (; i < value.length - 2; i += 3) {
      data.addInt(Number(value.substr(i, 3)), 10);
    }
    if (i < value.length - 1) {
      data.addInt(Number(value.substr(i, 2)), 7);
    } else if (i < value.length) {
      data.addInt(Number(value.substr(i, 1)), 4);
    }
  },

  alphaNumeric: (value) => (data, version) => {
    data.addInt(0b0010, 4);
    data.addInt(value.length, version < 10 ? 9 : version < 27 ? 11 : 13);
    let i = 0;
    for (; i < value.length - 1; i += 2) {
      data.addInt(alnum(value[i]) * 45 + alnum(value[i + 1]), 11);
    }
    if (i < value.length) {
      data.addInt(alnum(value[i]), 6);
    }
  },

  iso8859_1: (value) => {
    const bytes = new TextEncoder('iso-8859-1').encode(value);
    return (data, version) => {
      data.addInt(0b0100, 4);
      data.addInt(bytes.length, version < 10 ? 8 : 16);
      for (let i = 0; i < bytes.length; ++i) {
        data.addInt(bytes[i], 8);
      }
    };
  },
};
