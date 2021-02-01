import { data, names } from './corrections.mjs';

describe('corrections', () => {
  it('contains correction level IDs', () => {
    expect(data[names.L].id).toEqual(0b01);
    expect(data[names.M].id).toEqual(0b00);
    expect(data[names.Q].id).toEqual(0b11);
    expect(data[names.H].id).toEqual(0b10);
  });

  it('stores data in increasing robustness', () => {
    expect(names.M).toBeGreaterThan(names.L);
    expect(names.Q).toBeGreaterThan(names.M);
    expect(names.H).toBeGreaterThan(names.Q);
  });

  it('includes convenience max and min labels', () => {
    expect(names.max).toEqual(names.H);
    expect(names.min).toEqual(names.L);
  });

  it('divides input data into groups', () => {
    for (let i = 0; i < data.length; ++i) {
      for (let version = 1; version <= 40; ++version) {
        const item = data[i].v[version];
        let total = 0;
        item.groups.forEach((g) => {
          total += g[0] * g[1];
        });
        expect(total * 8).toEqual(item.capBits);
      }
    }
  });

  it('contains no empty or 0-count groups', () => {
    for (let i = 0; i < data.length; ++i) {
      for (let version = 1; version <= 40; ++version) {
        const item = data[i].v[version];
        expect(item.groups.length).toBeGreaterThan(0);
        item.groups.forEach((g) => {
          expect(g[0]).toBeGreaterThan(0);
          expect(g[1]).toBeGreaterThan(0);
        });
      }
    }
  });

  it('stores more data in larger versions', () => {
    for (let i = 0; i < data.length; ++i) {
      let last = data[i].v[1].capBits;
      for (let version = 2; version <= 40; ++version) {
        const cur = data[i].v[version].capBits;
        expect(cur).toBeGreaterThan(last);
        last = cur;
      }
    }
  });

  it('stores less data with more robust correction levels', () => {
    for (let version = 1; version <= 40; ++version) {
      let last = data[0].v[version].capBits;
      for (let i = 1; i < data.length; ++i) {
        const cur = data[i].v[version].capBits;
        expect(cur).toBeLessThan(last);
        last = cur;
      }
    }
  });

  it('1-L', () => {
    expect(data[names.L].v[1]).toEqual({ capBits: 19 * 8, ecsize: 7, groups: [[1, 19]] });
  });

  it('1-M', () => {
    expect(data[names.M].v[1]).toEqual({ capBits: 16 * 8, ecsize: 10, groups: [[1, 16]] });
  });

  it('1-Q', () => {
    expect(data[names.Q].v[1]).toEqual({ capBits: 13 * 8, ecsize: 13, groups: [[1, 13]] });
  });

  it('1-H', () => {
    expect(data[names.H].v[1]).toEqual({ capBits: 9 * 8, ecsize: 17, groups: [[1, 9]] });
  });

  it('2-L', () => {
    expect(data[names.L].v[2]).toEqual({ capBits: 34 * 8, ecsize: 10, groups: [[1, 34]] });
  });

  it('2-M', () => {
    expect(data[names.M].v[2]).toEqual({ capBits: 28 * 8, ecsize: 16, groups: [[1, 28]] });
  });

  it('2-Q', () => {
    expect(data[names.Q].v[2]).toEqual({ capBits: 22 * 8, ecsize: 22, groups: [[1, 22]] });
  });

  it('2-H', () => {
    expect(data[names.H].v[2]).toEqual({ capBits: 16 * 8, ecsize: 28, groups: [[1, 16]] });
  });

  it('3-L', () => {
    expect(data[names.L].v[3]).toEqual({ capBits: 55 * 8, ecsize: 15, groups: [[1, 55]] });
  });

  it('3-M', () => {
    expect(data[names.M].v[3]).toEqual({ capBits: 44 * 8, ecsize: 26, groups: [[1, 44]] });
  });

  it('3-Q', () => {
    expect(data[names.Q].v[3]).toEqual({ capBits: 34 * 8, ecsize: 18, groups: [[2, 17]] });
  });

  it('3-H', () => {
    expect(data[names.H].v[3]).toEqual({ capBits: 26 * 8, ecsize: 22, groups: [[2, 13]] });
  });

  it('5-Q', () => {
    expect(data[names.Q].v[5]).toEqual({
      capBits: 62 * 8,
      ecsize: 18,
      groups: [[2, 15], [2, 16]],
    });
  });

  it('5-H', () => {
    expect(data[names.H].v[5]).toEqual({
      capBits: 46 * 8,
      ecsize: 22,
      groups: [[2, 11], [2, 12]],
    });
  });

  it('10-L', () => {
    expect(data[names.L].v[10]).toEqual({
      capBits: 274 * 8,
      ecsize: 18,
      groups: [[2, 68], [2, 69]],
    });
  });

  it('10-M', () => {
    expect(data[names.M].v[10]).toEqual({
      capBits: 216 * 8,
      ecsize: 26,
      groups: [[4, 43], [1, 44]],
    });
  });

  it('10-Q', () => {
    expect(data[names.Q].v[10]).toEqual({
      capBits: 154 * 8,
      ecsize: 24,
      groups: [[6, 19], [2, 20]],
    });
  });

  it('10-H', () => {
    expect(data[names.H].v[10]).toEqual({
      capBits: 122 * 8,
      ecsize: 28,
      groups: [[6, 15], [2, 16]],
    });
  });

  it('11-H', () => {
    expect(data[names.H].v[11]).toEqual({
      capBits: 140 * 8,
      ecsize: 24,
      groups: [[3, 12], [8, 13]],
    });
  });

  it('14-L', () => {
    expect(data[names.L].v[14]).toEqual({
      capBits: 461 * 8,
      ecsize: 30,
      groups: [[3, 115], [1, 116]],
    });
  });

  it('17-M', () => {
    expect(data[names.M].v[17]).toEqual({
      capBits: 507 * 8,
      ecsize: 28,
      groups: [[10, 46], [1, 47]],
    });
  });

  it('21-H', () => {
    expect(data[names.H].v[21]).toEqual({
      capBits: 406 * 8,
      ecsize: 30,
      groups: [[19, 16], [6, 17]],
    });
  });

  it('25-M', () => {
    expect(data[names.M].v[25]).toEqual({
      capBits: 1000 * 8,
      ecsize: 28,
      groups: [[8, 47], [13, 48]],
    });
  });

  it('39-L', () => {
    expect(data[names.L].v[39]).toEqual({
      capBits: 2812 * 8,
      ecsize: 30,
      groups: [[20, 117], [4, 118]],
    });
  });

  it('39-M', () => {
    expect(data[names.M].v[39]).toEqual({
      capBits: 2216 * 8,
      ecsize: 28,
      groups: [[40, 47], [7, 48]],
    });
  });

  it('39-Q', () => {
    expect(data[names.Q].v[39]).toEqual({
      capBits: 1582 * 8,
      ecsize: 30,
      groups: [[43, 24], [22, 25]],
    });
  });

  it.skip('39-H', () => { // TODO: fix
    expect(data[names.H].v[39]).toEqual({
      capBits: 1222 * 8,
      ecsize: 30,
      groups: [[10, 15], [67, 16]],
    });
  });

  it('40-L', () => {
    expect(data[names.L].v[40]).toEqual({
      capBits: 2956 * 8,
      ecsize: 30,
      groups: [[19, 118], [6, 119]],
    });
  });

  it('40-M', () => {
    expect(data[names.M].v[40]).toEqual({
      capBits: 2334 * 8,
      ecsize: 28,
      groups: [[18, 47], [31, 48]],
    });
  });

  it.skip('40-Q', () => { // TODO: fix
    expect(data[names.Q].v[40]).toEqual({
      capBits: 1666 * 8,
      ecsize: 30,
      groups: [[34, 24], [34, 25]],
    });
  });

  it.skip('40-H', () => { // TODO: fix
    expect(data[names.H].v[40]).toEqual({
      capBits: 1276 * 8,
      ecsize: 30,
      groups: [[20, 15], [61, 16]],
    });
  });
});
