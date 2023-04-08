#!/usr/bin/env node

import { compressNum, quote } from './utils.mjs';
import { DATA_L, DATA_M, DATA_Q, DATA_H } from './corrections-data.mjs';

// this is a dev tool for generating the compressed data used in src/qr/options/corrections.mjs

const LEVELS = [DATA_L, DATA_M, DATA_Q, DATA_H];

// counterpart to corrections.mjs
const compress = ({ g1, g2, ecs }) =>
  compressNum(g1 + g2, 1) + compressNum(ecs, 1);

const data = [];
for (let version = 1; version <= 40; ++version) {
  for (let level = 0; level < 4; ++level) {
    data.push(compress(LEVELS[level][version - 1]));
  }
}

const code = `const CORRECTION_DATA =\n  ${quote(data.join(''))};`;

process.stdout.write(`${code}\n`);
process.stderr.write(`${code.length} bytes\n`);
