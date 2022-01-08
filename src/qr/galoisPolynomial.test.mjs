import { mult256PolyLn, rem256Poly } from './galoisPolynomial.mjs';

describe('mult256PolyLn', () => {
  it('multiplies two polynomials with log terms in Galois Field 256', () => {
    expect([...mult256PolyLn([0, 0], [0, 1])]).toEqual([0, 25, 1]);
    expect([...mult256PolyLn([0, 25, 1], [0, 2])]).toEqual([0, 198, 199, 3]);
  });

  it('is commutative', () => {
    const a = [5, 1, 250, 20];
    const b = [2, 99];
    expect(mult256PolyLn(a, b)).toEqual(mult256PolyLn(b, a));
  });

  it('is transitive', () => {
    const a = [5, 1, 250, 20];
    const b = [2, 99];
    const c = [100, 200, 255, 6];
    const r1 = mult256PolyLn(a, mult256PolyLn(b, c));
    const r2 = mult256PolyLn(mult256PolyLn(a, b), c);
    expect(r1).toEqual(r2);
  });

  it('is an identity function if either term is singular', () => {
    const a = [5, 1, 250, 20];
    expect([...mult256PolyLn(a, [0])]).toEqual(a);
    expect([...mult256PolyLn([0], a)]).toEqual(a);
  });
});

describe('rem256Poly', () => {
  it('divides a polynomial (with non-log terms) by another polynomial with log terms', () => {
    // implicit condition: denLn always begins with 0
    const num = [
      32, 91, 11, 120, 209, 114, 220, 77, 67, 64, 236, 17, 236, 17, 236, 17,
    ];
    const denLn = [0, 251, 67, 46, 61, 118, 70, 64, 94, 32, 45];
    const expected = [196, 35, 39, 119, 235, 215, 231, 226, 93, 23];
    expect([...rem256Poly(num, denLn)]).toEqual(expected);
  });
});
