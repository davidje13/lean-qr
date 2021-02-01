import {
  scoreLines,
  countBoxes,
  countPatterns,
  scoreImbalance,
} from './score.mjs';
import Bitmap2D from '../structures/Bitmap2D.mjs';

function makeBitmap(lines) {
  const bmp = new Bitmap2D({ size: lines.length });
  lines.forEach((line, y) => {
    for (let x = 0; x < line.length; ++x) {
      bmp.set(x, y, line[x] !== ' ');
    }
  });
  return bmp;
}

function makeBitmap1D(line, shift = 0, vert = false) {
  const bmp = new Bitmap2D({ size: line.length });
  for (let i = 0; i < line.length; ++i) {
    bmp.set(vert ? shift : i, vert ? i : shift, line[i] !== ' ');
  }
  return bmp;
}

describe('scoreLines', () => {
  it('adds 3 for all horizontal lines of either colour of length 5', () => {
    const score = scoreLines(makeBitmap([
      '# # # ',
      ' #####',
      '##### ',
      ' # # #',
      '#     ',
      ' # # #',
    ]));
    expect(score).toEqual(3 * 3);
  });

  it('adds 3 for all vertical lines of either colour of length 5', () => {
    const score = scoreLines(makeBitmap([
      '# # # ',
      ' # ## ',
      '### # ',
      ' # ## ',
      '### # ',
      ' # # #',
    ]));
    expect(score).toEqual(3 * 3);
  });

  it('adds 1 for each additional pixel of longer lines', () => {
    const score = scoreLines(makeBitmap([
      '# # # # ',
      ' # # # #',
      '# # # # ',
      '########',
      '# # # # ',
      ' # # # #',
      '# # # # ',
      ' # # # #',
    ]));
    expect(score).toEqual(6);
  });

  it('ignores broken lines', () => {
    const score = scoreLines(makeBitmap([
      '### # # ',
      ' # # #  ',
      '# # # # ',
      '#### ###',
      '### # # ',
      '   #    ',
      '# # # # ',
      ' # # #  ',
    ]));
    expect(score).toEqual(0);
  });
});

describe('countBoxes', () => {
  it('returns the number of 2x2 boxes of either colour', () => {
    const count = countBoxes(makeBitmap([
      '### # ',
      '## # #',
      '# ### ',
      ' # ###',
      '  # # ',
      '   # #',
    ]));
    expect(count).toEqual(3);
  });

  it('includes overlapping boxes', () => {
    const count = countBoxes(makeBitmap([
      '### # ',
      '#### #',
      '##### ',
      ' # # #',
      '# # # ',
      ' # # #',
    ]));
    expect(count).toEqual(5);
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
});

describe('scoreImbalance', () => {
  it('returns 0 for evenly distributed grids', () => {
    expect(scoreImbalance(makeBitmap([
      '# # # ',
      ' # # #',
      '# # # ',
      ' # # #',
      '# # # ',
      ' # # #',
    ]))).toEqual(0);

    expect(scoreImbalance(makeBitmap([
      '###   ',
      '###   ',
      '###   ',
      '###   ',
      '###   ',
      '###   ',
    ]))).toEqual(0);
  });

  it('returns 100 for highly imbalanced grids', () => {
    expect(scoreImbalance(makeBitmap([
      '######',
      '######',
      '######',
      '######',
      '######',
      '######',
    ]))).toEqual(100);

    expect(scoreImbalance(makeBitmap([
      '      ',
      '      ',
      '      ',
      '      ',
      '      ',
      '      ',
    ]))).toEqual(100);
  });

  it('returns multiples of 10', () => {
    expect(scoreImbalance(makeBitmap([
      ' #####',
      '######',
      '######',
      '######',
      '######',
      '######',
    ]))).toEqual(90);
  });
});
