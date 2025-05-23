#!/usr/bin/env -S node --disable-proto delete --disallow-code-generation-from-strings
import { readFileSync } from 'node:fs';
import { drawTable } from './table.mjs';

const prefix = '  Failure: ::result::';

const results = readFileSync(process.stdin.fd)
  .toString('utf-8')
  .split('\n')
  .filter((v) => v.startsWith(prefix))
  .map((v) => JSON.parse(v.substring(prefix.length)));

if (!results.length) {
  throw new Error('Got no results to analyse');
}

const libraryResults = group(
  results,
  (result) => result.libraryName + ' - ' + getAgent(result.agent),
);

const sortedLibraryRuns = [...libraryResults.entries()].sort((a, b) =>
  a[0] < b[0] ? -1 : 1,
);

const allTests = [
  ...group(
    results.flatMap((result) => result.tests),
    (test) => test.testName,
  ).keys(),
];

const table = [
  ['l', 'l', 'r', ...allTests.flatMap(() => ['r', 'r', 'r', 'r'])],
  [
    '',
    '',
    '',
    ...allTests.flatMap((testName) => [['l', testName], null, null, null]),
  ],
  [
    'Library',
    'Environment',
    'Load time',
    ...allTests.flatMap(() => [
      ['l', 'first'],
      ['l', 'avg'],
      ['l', 'avg rate'],
      ['l', 'samples'],
    ]),
  ],
  null,
];

for (const [, libRuns] of sortedLibraryRuns) {
  // take the best result of all the runs, so that libraries are not
  // punished for running when (e.g.) a background task is using CPU

  const row = [libRuns[0].libraryName, getAgent(libRuns[0].agent)];
  table.push(row);

  const bestLoad = libRuns.reduce((a, b) =>
    b.error ? a : a.error ? b : a.load < b.load ? a : b,
  );
  if (bestLoad.error) {
    row.push(
      ['l', '[init error]'],
      ...allTests.flatMap(() => [null, null, null, null]),
    );
    continue;
  }
  row.push(fmt(bestLoad.load) + 'ms');

  const tests = group(
    libRuns.flatMap((run) => run.tests),
    (test) => test.testName,
  );
  for (const testName of allTests) {
    const testRuns = tests.get(testName);
    if (!testRuns) {
      row.push(['l', '[skipped]'], null, null, null);
      continue;
    }
    const bestTestRun = testRuns.reduce(bestRun);
    if (bestTestRun.error) {
      row.push(['l', '[run error]'], null, null, null);
    } else if (wasInterrupted(bestTestRun)) {
      row.push(
        ['l', '[interrupted by other task, try again]'],
        null,
        null,
        null,
      );
    } else {
      row.push(
        fmt(bestTestRun.first) + 'ms',
        fmt(bestTestRun.average) + 'ms',
        rate(bestTestRun.average) + '/s',
        String(bestTestRun.samples),
      );
    }
  }
}

function wasInterrupted(run) {
  return run.worst > run.average * 2 + 50;
}

function bestRun(a, b) {
  if (b.error) {
    return a;
  }
  if (a.error) {
    return b;
  }
  if (wasInterrupted(b)) {
    return a;
  }
  if (wasInterrupted(a)) {
    return b;
  }
  return a.average < b.average ? a : b;
}

process.stdout.write(drawTable(table));

function fmt(v) {
  return typeof v === 'number' ? v.toFixed(2) : '?';
}

function rate(v) {
  return Number.parseFloat((1000 / v).toPrecision(2)).toFixed(0);
}

function group(items, keyGen) {
  const grouped = new Map();
  for (const item of items) {
    const key = keyGen(item);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(item);
  }
  return grouped;
}

function getAgent(userAgent) {
  return (
    /(Node\.js|HeadlessChrome|Firefox)\/\d+/.exec(userAgent)?.[0] ?? userAgent
  );
}
