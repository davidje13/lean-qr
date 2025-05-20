import { scoreCode } from './score.mjs';
import {
  scoreLines,
  countBoxes,
  countPatterns,
  scoreImbalance,
} from './score-test-comparisons.mjs';
import { Bitmap2D } from '../structures/Bitmap2D.mjs';
import { makeBitmap } from '../test-helpers/makeBitmap.mjs';

// Source: https://www.thonky.com/qr-code-tutorial/data-masking
const sample = makeBitmap([
  '#######   #   #######',
  '#     # ## #  #     #',
  '# ### # #  #  # ### #',
  '# ### #    ## # ### #',
  '# ### #    ## # ### #',
  '#     #  # #  #     #',
  '####### # # # #######',
  '         #           ',
  ' ### ##           ## ',
  '#    # #### ##  #####',
  '# ### ## # ## #   #  ',
  ' ###   # #   #  # ## ',
  '# ##  #  # ##     #  ',
  '        #  # # #  ## ',
  '#######   # #### # ##',
  '#     # ##   ###  ## ',
  '# ### #    ## ##   ##',
  '# ### # # #  #  ## # ',
  '# ### # ### ##  ##   ',
  '#     # ####  ## #   ',
  '#######        #  ## ',
]);

const hLines = makeBitmap([
  '# # # ',
  ' #####',
  '##### ',
  ' # # #',
  '#     ',
  ' # # #',
]);

const vLines = makeBitmap([
  '# # # ',
  ' # ## ',
  '### # ',
  ' # ## ',
  '### # ',
  ' # # #',
]);

const longLine = makeBitmap([
  '# # # # ',
  ' # # # #',
  '# # # # ',
  '########',
  '# # # # ',
  ' # # # #',
  '# # # # ',
  ' # # # #',
]);

const brokenLines = makeBitmap([
  '### # # ',
  ' # # #  ',
  '# # # # ',
  '#### ###',
  '### # # ',
  '   #    ',
  '# # # # ',
  ' # # #  ',
]);

describe('scoreLines', () => {
  it('adds 3 for all horizontal lines of either colour of length 5', () => {
    expect(scoreLines(hLines)).toEqual(3 * 3);
  });

  it('adds 3 for all vertical lines of either colour of length 5', () => {
    expect(scoreLines(vLines)).toEqual(3 * 3);
  });

  it('adds 1 for each additional pixel of longer lines', () => {
    expect(scoreLines(longLine)).toEqual(6);
  });

  it('ignores broken lines', () => {
    expect(scoreLines(brokenLines)).toEqual(0);
  });

  it('produces the expected result for the sample code', () => {
    expect(scoreLines(sample)).toEqual(180);
  });
});

const smallBoxes = makeBitmap([
  '### # ',
  '## # #',
  '# ### ',
  ' # ###',
  '  # # ',
  '   # #',
]);
const overlapBoxes = makeBitmap([
  '### # ',
  '#### #',
  '##### ',
  ' # # #',
  '# # # ',
  ' # # #',
]);

describe('countBoxes', () => {
  it('returns the number of 2x2 boxes of either colour', () => {
    expect(countBoxes(smallBoxes)).toEqual(3);
  });

  it('includes overlapping boxes', () => {
    expect(countBoxes(overlapBoxes)).toEqual(5);
  });

  it('produces the expected result for the sample code', () => {
    expect(countBoxes(sample)).toEqual(47);
  });
});

describe('countPatterns', () => {
  it('counts horizontal matches in the forward direction', () => {
    expect(countPatterns(makeBitmap1D('              '))).toEqual(0);
    expect(countPatterns(makeBitmap1D('##############'))).toEqual(0);
    expect(countPatterns(makeBitmap1D('    # ### #   '))).toEqual(1);
    expect(countPatterns(makeBitmap1D('       # ### #'))).toEqual(1);
    expect(countPatterns(makeBitmap1D('###    # ### #'))).toEqual(1);
    expect(countPatterns(makeBitmap1D('  #    # ### #'))).toEqual(1);
    expect(countPatterns(makeBitmap1D('     # # ### #'))).toEqual(0);
    expect(countPatterns(makeBitmap1D('    # ###  #  '))).toEqual(0);
    expect(countPatterns(makeBitmap1D('        # ### '))).toEqual(0);
  });

  it('counts horizontal matches in the reverse direction', () => {
    expect(countPatterns(makeBitmap1D('              '))).toEqual(0);
    expect(countPatterns(makeBitmap1D('##############'))).toEqual(0);
    expect(countPatterns(makeBitmap1D('   # ### #    '))).toEqual(1);
    expect(countPatterns(makeBitmap1D('# ### #       '))).toEqual(1);
    expect(countPatterns(makeBitmap1D('# ### #    ###'))).toEqual(1);
    expect(countPatterns(makeBitmap1D('# ### #    #  '))).toEqual(1);
    expect(countPatterns(makeBitmap1D('# ### # #     '))).toEqual(0);
    expect(countPatterns(makeBitmap1D('  #  ### #    '))).toEqual(0);
    expect(countPatterns(makeBitmap1D(' ### #        '))).toEqual(0);
  });

  it('counts vertical matches in the forward direction', () => {
    expect(countPatterns(makeBitmap1D('              ', 0, true))).toEqual(0);
    expect(countPatterns(makeBitmap1D('##############', 0, true))).toEqual(0);
    expect(countPatterns(makeBitmap1D('    # ### #   ', 0, true))).toEqual(1);
    expect(countPatterns(makeBitmap1D('       # ### #', 0, true))).toEqual(1);
    expect(countPatterns(makeBitmap1D('###    # ### #', 0, true))).toEqual(1);
    expect(countPatterns(makeBitmap1D('  #    # ### #', 0, true))).toEqual(1);
    expect(countPatterns(makeBitmap1D('     # # ### #', 0, true))).toEqual(0);
    expect(countPatterns(makeBitmap1D('    # ###  #  ', 0, true))).toEqual(0);
    expect(countPatterns(makeBitmap1D('        # ### ', 0, true))).toEqual(0);
  });

  it('counts vertical matches in the reverse direction', () => {
    expect(countPatterns(makeBitmap1D('              ', 0, true))).toEqual(0);
    expect(countPatterns(makeBitmap1D('##############', 0, true))).toEqual(0);
    expect(countPatterns(makeBitmap1D('   # ### #    ', 0, true))).toEqual(1);
    expect(countPatterns(makeBitmap1D('# ### #       ', 0, true))).toEqual(1);
    expect(countPatterns(makeBitmap1D('# ### #    ###', 0, true))).toEqual(1);
    expect(countPatterns(makeBitmap1D('# ### #    #  ', 0, true))).toEqual(1);
    expect(countPatterns(makeBitmap1D('# ### # #     ', 0, true))).toEqual(0);
    expect(countPatterns(makeBitmap1D('  #  ### #    ', 0, true))).toEqual(0);
    expect(countPatterns(makeBitmap1D(' ### #        ', 0, true))).toEqual(0);
  });

  it('produces the expected result for the sample code', () => {
    expect(countPatterns(sample)).toEqual(3);
  });
});

const dither = makeBitmap([
  '# # # ',
  ' # # #',
  '# # # ',
  ' # # #',
  '# # # ',
  ' # # #',
]);

const leftRight = makeBitmap([
  '###   ',
  '###   ',
  '###   ',
  '###   ',
  '###   ',
  '###   ',
]);

const allOn = makeBitmap([
  '######',
  '######',
  '######',
  '######',
  '######',
  '######',
]);

const allOff = makeBitmap([
  '      ',
  '      ',
  '      ',
  '      ',
  '      ',
  '      ',
]);

describe('scoreImbalance', () => {
  it('returns 0 for evenly distributed grids', () => {
    expect(scoreImbalance(dither)).toEqual(0);
    expect(scoreImbalance(leftRight)).toEqual(0);
  });

  it('returns 10 for highly imbalanced grids', () => {
    expect(scoreImbalance(allOn)).toEqual(10);
    expect(scoreImbalance(allOff)).toEqual(10);
  });

  it('returns integers', () => {
    expect(
      scoreImbalance(
        makeBitmap([
          ' #####',
          '######',
          '######',
          '######',
          '######',
          '######',
        ]),
      ),
    ).toEqual(9);
  });

  it('produces the expected result for the sample code', () => {
    // sample source is incorrectly 2 here as it does not quantise
    expect(scoreImbalance(sample)).toEqual(0);
  });
});

const ALL_SAMPLES = [
  sample,
  hLines,
  vLines,
  longLine,
  brokenLines,
  smallBoxes,
  overlapBoxes,
  dither,
  leftRight,
  allOn,
  allOff,
];

describe('scoreCode', () => {
  it('combines all scores', { parameters: ALL_SAMPLES }, (code) => {
    expect(scoreCode(code)).toEqual(
      scoreLines(code) +
        countBoxes(code) * 3 +
        countPatterns(code) * 40 +
        scoreImbalance(code) * 10,
    );
  });

  it('ignores masking bits', { parameters: ALL_SAMPLES }, (code) => {
    const withMask = Bitmap2D(code.size, code._data);
    for (let i = 0; i < withMask._data.length; ++i) {
      withMask._data[i] |= i & 0b00000010;
    }
    expect(scoreCode(withMask)).toEqual(scoreCode(code));
  });

  it('matches a known sample score', () => {
    expect(scoreCode(sample)).toEqual(180 + 47 * 3 + 3 * 40 + 0);
  });
});

function makeBitmap1D(line, shift = 0, vert = false) {
  const bmp = Bitmap2D(line.length);
  for (let i = 0; i < line.length; ++i) {
    const x = vert ? shift : i;
    const y = vert ? i : shift;
    bmp._data[y * bmp.size + x] = line[i] !== ' ';
  }
  return bmp;
}
