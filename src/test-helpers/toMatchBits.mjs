export const toMatchBits = (expectedBits) => (actual) => {
  if (
    typeof expectedBits === 'object' &&
    expectedBits._bytes &&
    typeof expectedBits._bits === 'number'
  ) {
    expectedBits = extractBitstring(expectedBits);
  }
  if (typeof expectedBits !== 'string') {
    throw new Error('bits expectation should be a string of 0s and 1s');
  }
  if (
    typeof actual !== 'object' ||
    !actual._bytes ||
    typeof actual._bits !== 'number'
  ) {
    throw new Error(`Expected bits, got ${actual}`);
  }

  const actualConv = extractBitstring(actual);

  const expectedParts = expectedBits.trim().split(/\s+/g);
  const actualParts = [];
  let p = 0;
  for (const part of expectedParts) {
    actualParts.push(actualConv.slice(p, p + part.length));
    p += part.length;
  }
  if (p < actualConv.length) {
    actualParts.push(actualConv.slice(p));
  }

  return toEqual(expectedParts.join(' '))(actualParts.join(' '));
};

function extractBitstring(o) {
  return [...o._bytes]
    .map((b) => b.toString(2).padStart(8, '0'))
    .join('')
    .slice(0, o._bits);
}
