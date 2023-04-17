const shortMessage = 'THIS IS MY MESSAGE';
const longMessage =
  `The value of \u03C0 is 3.14159265358979323846264338327950288419716939937510582097494459230781640628620899862803482534211706798214\u2026 (accoring to https://oeis.org/A000796). Having so many digits means it will probably be advantageous to encode it using numeric mode, even though it has Unicode characters around it. WE CAN ALSO USE BLOCK CAPITALS FOR PARTS OF THE MESSAGE, WHICH WILL PROBABLY BE BEST ENCODED AS ALPHANUMERIC. Finally we can use some \u00A3 characters which are best encoded in ISO8859-1, though the cost of switching ECI from Unicode means we will need quite a few of them to make it worthwhile ${'\u00A3'.repeat(30)}.`.repeat(
    5,
  );
const pathologicalMessage = 'A1'.repeat(2100);

export const isBrowser = !navigator.userAgent.startsWith('Node');

export const tests = [
  { name: 'Short', content: shortMessage },
  { name: 'Long', content: longMessage },
  { name: 'Pathological', content: pathologicalMessage },
];

const makeMeasure = (fn) => async (content) => {
  const maxRuns = 5000;
  const maxTime = 5000;
  const randoms = [];
  for (let i = 0; i < maxRuns; ++i) {
    randoms.push(Math.random().toFixed(10).substring(2));
  }
  const times = [];

  try {
    let totalTm = 0;
    let tm0 = performance.now();
    const timeLimit = tm0 + maxTime;
    let samples = maxRuns;
    for (let i = 0; i < maxRuns; ++i) {
      const tmA = performance.now();
      await fn(content + randoms[i]);
      const tmB = performance.now();
      times.push(tmB - tmA);

      if (tmB > tm0 + 300) {
        // run main event loop to allow runner to respond to pings (avoid being killed as unresponsive)
        totalTm += tmB - tm0;
        await new Promise((resolve) => setTimeout(resolve, 0));
        tm0 = performance.now();
        if (tm0 > timeLimit) {
          samples = i;
          break;
        }
      }
    }
    totalTm += performance.now() - tm0;

    return {
      first: times[0],
      average: totalTm / samples,
      worst: Math.max(...times),
      samples,
    };
  } catch (e) {
    return { error: String(e) };
  }
};

export function runPerformanceTest(name, prep, fn) {
  it(name, async () => {
    const output = {
      libraryName: name,
      agent: navigator.userAgent,
      tests: [],
    };
    let imported;

    // hack browser compatibility for import(cjs)
    const exports = {};
    globalThis.exports = exports;
    globalThis.module = { exports };

    try {
      const tm0 = performance.now();
      imported = await prep();
      output.load = performance.now() - tm0;
    } catch (e) {
      output.error = String(e);
      fail('::result::' + JSON.stringify(output));
    }

    // if exports / module.exports got populated, use that
    if (globalThis.module.exports !== exports) {
      imported = { default: globalThis.module.exports };
    } else if (Object.keys(exports).length > 0) {
      imported = exports;
    }

    const boundFn = await fn(imported);
    const measure = makeMeasure(boundFn);
    for (const test of tests) {
      const results = await measure(test.content);
      output.tests.push({ testName: test.name, ...results });
    }
    fail('::result::' + JSON.stringify(output)); // "fail" so we can get data out of runner
  });
}

export async function loadGlobalScript(src, test) {
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.addEventListener('load', resolve, { once: true });
    script.addEventListener('error', reject, { once: true });
    script.src = src;
    document.body.append(script);
  });

  const tm0 = Date.now();
  while (!test()) {
    if (Date.now() > tm0 + 2000) {
      throw new Error(`loading script ${src} failed`);
    }
    await new Promise((resolve) => setTimeout(resolve, 0));
  }
  return test();
}
