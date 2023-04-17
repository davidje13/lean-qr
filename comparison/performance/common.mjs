const shortMessage = 'THIS IS MY MESSAGE';
const longMessage =
  'The value of \u03C0 is 3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214\u2026 (accoring to https://oeis.org/A000796). Having so many digits means it will probably be advantageous to encode it using numeric mode, even though it has Unicode characters around it. WE CAN ALSO USE BLOCK CAPITALS FOR PARTS OF THE MESSAGE, WHICH WILL PROBABLY BE BEST ENCODED AS ALPHANUMERIC. Finally we can use some \u00A3 characters which are best encoded in ISO8859-1, though the cost of switching ECI from Unicode means we will need quite a few of them to make it worthwhile \u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3\u00A3.'.repeat(
    5,
  );
const pathologicalMessage = 'A1'.repeat(2100);

export const tests = [
  { name: 'Short', content: shortMessage },
  { name: 'Long', content: longMessage },
  { name: 'Pathological', content: pathologicalMessage },
];

export const out =
  typeof process !== 'undefined' ? (m) => process.stdout.write(m) : console.log;
export const log =
  typeof process !== 'undefined' ? (m) => process.stderr.write(m) : console.log;

const makeMeasure =
  (fn) =>
  async ({ name, content }) => {
    out(`${name}:\n`);

    const repeat = 500;
    const randoms = [];
    for (let i = 0; i < repeat; ++i) {
      randoms.push(Math.random().toFixed(10).substring(2));
    }
    const times = [];

    try {
      const tm0 = performance.now();
      for (let i = 0; i < repeat; ++i) {
        const tmA = performance.now();
        await fn(content + randoms[i]);
        const tmB = performance.now();
        times.push(tmB - tmA);
      }
      const tm1 = performance.now();

      const first = times[0];
      const average = (tm1 - tm0) / repeat;
      const best = Math.min(...times);
      const worst = Math.max(...times);
      out(`  first:   ${fmt(first)}ms\n`);
      out(`  average: ${fmt(average)}ms = ${(1000 / average).toFixed(0)}/s\n`);
      out(`  best:    ${fmt(best)}ms = ${(1000 / best).toFixed(0)}/s\n`);
      out(`  worst:   ${fmt(worst)}ms = ${(1000 / worst).toFixed(0)}/s\n`);
    } catch (e) {
      out(`  ${e}\n`);
    }
  };

export async function runPerformanceTest(fn) {
  const measure = makeMeasure(fn, out, log);
  for (const test of tests) {
    log(`testing performance (${test.name})...\n`);
    await measure(test);
  }
  out('\n');
}

export function showMessages() {
  log(`Using messages:\n`);
  for (const { name, content } of tests) {
    log(`${name} (${content.length}): ${content}\n`);
  }
}

function fmt(v) {
  return v.toFixed(2).padStart(8, ' ');
}
