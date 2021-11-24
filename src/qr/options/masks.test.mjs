import masks from './masks.mjs';

const expectedPatterns = {
  0: (
    '# # # \n' +
    ' # # #\n' +
    '# # # \n' +
    ' # # #\n' +
    '# # # \n' +
    ' # # #\n'
  ),
  1: (
    '######\n' +
    '      \n' +
    '######\n' +
    '      \n' +
    '######\n' +
    '      \n'
  ),
  2: (
    '#  #  \n' +
    '#  #  \n' +
    '#  #  \n' +
    '#  #  \n' +
    '#  #  \n' +
    '#  #  \n'
  ),
  3: (
    '#  #  \n' +
    '  #  #\n' +
    ' #  # \n' +
    '#  #  \n' +
    '  #  #\n' +
    ' #  # \n'
  ),
  4: (
    '###   \n' +
    '###   \n' +
    '   ###\n' +
    '   ###\n'
  ),
  5: (
    '######\n' +
    '#     \n' +
    '#  #  \n' +
    '# # # \n' +
    '#  #  \n' +
    '#     \n'
  ),
  6: (
    '######\n' +
    '###   \n' +
    '## ## \n' +
    '# # # \n' +
    '# ## #\n' +
    '#   ##\n'
  ),
  7: (
    '# # # \n' +
    '   ###\n' +
    '#   ##\n' +
    ' # # #\n' +
    '###   \n' +
    ' ###  \n'
  ),
};

describe('masks', () => {
  it('contains 8 mask patterns', () => {
    expect(masks).toHaveLength(8);
  });

  masks.forEach((mask, id) => describe(`mask ${id}`, () => {
    const dimX = 6;
    const dimY = (id === 4 ? 4 : 6);

    it('returns true or false for any given pixel location', () => {
      for (let y = 0; y < 10; ++y) {
        for (let x = 0; x < 10; ++x) {
          const value = mask(x, y);
          expect(typeof value).toEqual('boolean');
        }
      }
    });

    it(`defines a repeating ${dimX}x${dimY} pattern`, () => {
      for (let y = 0; y < dimY; ++y) {
        for (let x = 0; x < dimX; ++x) {
          const value = mask(x, y);
          expect(value).toEqual(mask(x + dimX, y));
          expect(value).toEqual(mask(x, y + dimY));
          expect(value).toEqual(mask(x + dimX, y + dimY));
        }
      }
    });

    it('matches the expected pattern', () => {
      let actual = '';
      for (let y = 0; y < dimY; ++y) {
        for (let x = 0; x < dimX; ++x) {
          actual += mask(x, y) ? '#' : ' ';
        }
        actual += '\n';
      }
      expect(actual).toEqual(expectedPatterns[id]);
    });
  }));
});
