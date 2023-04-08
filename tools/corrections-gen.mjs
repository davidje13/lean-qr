#!/usr/bin/env node

import { compressNum, quote } from './utils.mjs';
import { DATA_L, DATA_M, DATA_Q, DATA_H } from './corrections-data.mjs';

// this is a dev tool for generating the compressed data used in src/qr/options/corrections.mjs

const LEVELS = [DATA_L, DATA_M, DATA_Q, DATA_H];

const outTotalGroups = [];
const outEcs = [];
for (let version = 1; version <= 40; ++version) {
  for (let level = 0; level < 4; ++level) {
    const { g1, g2, ecs } = LEVELS[level][version - 1];
    outTotalGroups.push(compressNum(g1 + g2, 1));
    outEcs.push(compressNum(ecs, 1));
  }
}

const all = [...outEcs.slice(0, 9), ...outTotalGroups.slice(9)];

const code = `const CORRECTION_DATA =\n  ${quote(all.join(''))};`;

process.stdout.write(`${code}\n`);
process.stderr.write(`${code.length} bytes\n`);
