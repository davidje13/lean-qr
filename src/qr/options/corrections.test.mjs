import { correctionData, correction } from './corrections.mjs';

describe('corrections', () => {
  it('contains correction level IDs', () => {
    expect(correctionData[correction.L][0]._id).toEqual(0b01);
    expect(correctionData[correction.M][0]._id).toEqual(0b00);
    expect(correctionData[correction.Q][0]._id).toEqual(0b11);
    expect(correctionData[correction.H][0]._id).toEqual(0b10);
  });

  it('stores data in increasing robustness', () => {
    expect(correction.M).toBeGreaterThan(correction.L);
    expect(correction.Q).toBeGreaterThan(correction.M);
    expect(correction.H).toBeGreaterThan(correction.Q);
  });

  it('includes convenience max and min labels', () => {
    expect(correction.max).toEqual(correction.H);
    expect(correction.min).toEqual(correction.L);
  });

  it('divides input data into groups', () => {
    for (let i = 0; i < correctionData.length; ++i) {
      for (let version = 1; version <= 40; ++version) {
        const item = correctionData[i][version - 1];
        let total = 0;
        item._groups.forEach((g) => {
          total += g[0] * g[1];
        });
        expect(total * 8).toEqual(item._capacityBits);
      }
    }
  });

  it('contains no empty or 0-count groups', () => {
    for (let i = 0; i < correctionData.length; ++i) {
      for (let version = 1; version <= 40; ++version) {
        const item = correctionData[i][version - 1];
        expect(item._groups.length).toBeGreaterThan(0);
        item._groups.forEach((g) => {
          expect(g[0]).toBeGreaterThan(0);
          expect(g[1]).toBeGreaterThan(0);
        });
      }
    }
  });

  it('stores more data in larger versions', () => {
    for (let i = 0; i < correctionData.length; ++i) {
      let last = correctionData[i][0]._capacityBits;
      for (let version = 2; version <= 40; ++version) {
        const cur = correctionData[i][version - 1]._capacityBits;
        expect(cur).toBeGreaterThan(last);
        last = cur;
      }
    }
  });

  it('stores less data with more robust correction levels', () => {
    for (let version = 1; version <= 40; ++version) {
      let last = correctionData[0][version - 1]._capacityBits;
      for (let i = 1; i < correctionData.length; ++i) {
        const cur = correctionData[i][version - 1]._capacityBits;
        expect(cur).toBeLessThan(last);
        last = cur;
      }
    }
  });

  // comparison data from https://www.thonky.com/qr-code-tutorial/error-correction-table
  /* prettier-ignore */
  const dataset = {
     1: { L: [ 7, [ 1, 19]          ], M: [10, [ 1, 16]          ], Q: [13, [ 1, 13]          ], H: [17, [ 1,  9]          ] },
     2: { L: [10, [ 1, 34]          ], M: [16, [ 1, 28]          ], Q: [22, [ 1, 22]          ], H: [28, [ 1, 16]          ] },
     3: { L: [15, [ 1, 55]          ], M: [26, [ 1, 44]          ], Q: [18, [ 2, 17]          ], H: [22, [ 2, 13]          ] },
     4: { L: [20, [ 1, 80]          ], M: [18, [ 2, 32]          ], Q: [26, [ 2, 24]          ], H: [16, [ 4,  9]          ] },
     5: { L: [26, [ 1,108]          ], M: [24, [ 2, 43]          ], Q: [18, [ 2, 15], [ 2, 16]], H: [22, [ 2, 11], [ 2, 12]] },
     6: { L: [18, [ 2, 68]          ], M: [16, [ 4, 27]          ], Q: [24, [ 4, 19]          ], H: [28, [ 4, 15]          ] },
     7: { L: [20, [ 2, 78]          ], M: [18, [ 4, 31]          ], Q: [18, [ 2, 14], [ 4, 15]], H: [26, [ 4, 13], [ 1, 14]] },
     8: { L: [24, [ 2, 97]          ], M: [22, [ 2, 38], [ 2, 39]], Q: [22, [ 4, 18], [ 2, 19]], H: [26, [ 4, 14], [ 2, 15]] },
     9: { L: [30, [ 2,116]          ], M: [22, [ 3, 36], [ 2, 37]], Q: [20, [ 4, 16], [ 4, 17]], H: [24, [ 4, 12], [ 4, 13]] },
    10: { L: [18, [ 2, 68], [ 2, 69]], M: [26, [ 4, 43], [ 1, 44]], Q: [24, [ 6, 19], [ 2, 20]], H: [28, [ 6, 15], [ 2, 16]] },
    11: { L: [20, [ 4, 81]          ], M: [30, [ 1, 50], [ 4, 51]], Q: [28, [ 4, 22], [ 4, 23]], H: [24, [ 3, 12], [ 8, 13]] },
    12: { L: [24, [ 2, 92], [ 2, 93]], M: [22, [ 6, 36], [ 2, 37]], Q: [26, [ 4, 20], [ 6, 21]], H: [28, [ 7, 14], [ 4, 15]] },
    13: { L: [26, [ 4,107]          ], M: [22, [ 8, 37], [ 1, 38]], Q: [24, [ 8, 20], [ 4, 21]], H: [22, [12, 11], [ 4, 12]] },
    14: { L: [30, [ 3,115], [ 1,116]], M: [24, [ 4, 40], [ 5, 41]], Q: [20, [11, 16], [ 5, 17]], H: [24, [11, 12], [ 5, 13]] },
    15: { L: [22, [ 5, 87], [ 1, 88]], M: [24, [ 5, 41], [ 5, 42]], Q: [30, [ 5, 24], [ 7, 25]], H: [24, [11, 12], [ 7, 13]] },
    16: { L: [24, [ 5, 98], [ 1, 99]], M: [28, [ 7, 45], [ 3, 46]], Q: [24, [15, 19], [ 2, 20]], H: [30, [ 3, 15], [13, 16]] },
    17: { L: [28, [ 1,107], [ 5,108]], M: [28, [10, 46], [ 1, 47]], Q: [28, [ 1, 22], [15, 23]], H: [28, [ 2, 14], [17, 15]] },
    18: { L: [30, [ 5,120], [ 1,121]], M: [26, [ 9, 43], [ 4, 44]], Q: [28, [17, 22], [ 1, 23]], H: [28, [ 2, 14], [19, 15]] },
    19: { L: [28, [ 3,113], [ 4,114]], M: [26, [ 3, 44], [11, 45]], Q: [26, [17, 21], [ 4, 22]], H: [26, [ 9, 13], [16, 14]] },
    20: { L: [28, [ 3,107], [ 5,108]], M: [26, [ 3, 41], [13, 42]], Q: [30, [15, 24], [ 5, 25]], H: [28, [15, 15], [10, 16]] },
    21: { L: [28, [ 4,116], [ 4,117]], M: [26, [17, 42]          ], Q: [28, [17, 22], [ 6, 23]], H: [30, [19, 16], [ 6, 17]] },
    22: { L: [28, [ 2,111], [ 7,112]], M: [28, [17, 46]          ], Q: [30, [ 7, 24], [16, 25]], H: [24, [34, 13]          ] },
    23: { L: [30, [ 4,121], [ 5,122]], M: [28, [ 4, 47], [14, 48]], Q: [30, [11, 24], [14, 25]], H: [30, [16, 15], [14, 16]] },
    24: { L: [30, [ 6,117], [ 4,118]], M: [28, [ 6, 45], [14, 46]], Q: [30, [11, 24], [16, 25]], H: [30, [30, 16], [ 2, 17]] },
    25: { L: [26, [ 8,106], [ 4,107]], M: [28, [ 8, 47], [13, 48]], Q: [30, [ 7, 24], [22, 25]], H: [30, [22, 15], [13, 16]] },
    26: { L: [28, [10,114], [ 2,115]], M: [28, [19, 46], [ 4, 47]], Q: [28, [28, 22], [ 6, 23]], H: [30, [33, 16], [ 4, 17]] },
    27: { L: [30, [ 8,122], [ 4,123]], M: [28, [22, 45], [ 3, 46]], Q: [30, [ 8, 23], [26, 24]], H: [30, [12, 15], [28, 16]] },
    28: { L: [30, [ 3,117], [10,118]], M: [28, [ 3, 45], [23, 46]], Q: [30, [ 4, 24], [31, 25]], H: [30, [11, 15], [31, 16]] },
    29: { L: [30, [ 7,116], [ 7,117]], M: [28, [21, 45], [ 7, 46]], Q: [30, [ 1, 23], [37, 24]], H: [30, [19, 15], [26, 16]] },
    30: { L: [30, [ 5,115], [10,116]], M: [28, [19, 47], [10, 48]], Q: [30, [15, 24], [25, 25]], H: [30, [23, 15], [25, 16]] },
    31: { L: [30, [13,115], [ 3,116]], M: [28, [ 2, 46], [29, 47]], Q: [30, [42, 24], [ 1, 25]], H: [30, [23, 15], [28, 16]] },
    32: { L: [30, [17,115]          ], M: [28, [10, 46], [23, 47]], Q: [30, [10, 24], [35, 25]], H: [30, [19, 15], [35, 16]] },
    33: { L: [30, [17,115], [ 1,116]], M: [28, [14, 46], [21, 47]], Q: [30, [29, 24], [19, 25]], H: [30, [11, 15], [46, 16]] },
    34: { L: [30, [13,115], [ 6,116]], M: [28, [14, 46], [23, 47]], Q: [30, [44, 24], [ 7, 25]], H: [30, [59, 16], [ 1, 17]] },
    35: { L: [30, [12,121], [ 7,122]], M: [28, [12, 47], [26, 48]], Q: [30, [39, 24], [14, 25]], H: [30, [22, 15], [41, 16]] },
    36: { L: [30, [ 6,121], [14,122]], M: [28, [ 6, 47], [34, 48]], Q: [30, [46, 24], [10, 25]], H: [30, [ 2, 15], [64, 16]] },
    37: { L: [30, [17,122], [ 4,123]], M: [28, [29, 46], [14, 47]], Q: [30, [49, 24], [10, 25]], H: [30, [24, 15], [46, 16]] },
    38: { L: [30, [ 4,122], [18,123]], M: [28, [13, 46], [32, 47]], Q: [30, [48, 24], [14, 25]], H: [30, [42, 15], [32, 16]] },
    39: { L: [30, [20,117], [ 4,118]], M: [28, [40, 47], [ 7, 48]], Q: [30, [43, 24], [22, 25]], H: [30, [10, 15], [67, 16]] },
    40: { L: [30, [19,118], [ 6,119]], M: [28, [18, 47], [31, 48]], Q: [30, [34, 24], [34, 25]], H: [30, [20, 15], [61, 16]] },
  };

  it(
    'uses correct data for various sizes',
    {
      parameters: [
        new Set(Object.keys(dataset)),
        new Set(['L', 'M', 'Q', 'H']),
      ],
    },
    (version, level) => {
      const [ecSize, ...groups] = dataset[version][level];
      const info = correctionData[correction[level]][version - 1];
      expect(info._ecSize).toEqual(ecSize);
      expect(info._groups).toEqual(groups);
    },
  );
});
