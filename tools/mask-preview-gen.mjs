#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { toPngBuffer } from '../src/extras/node_export.mjs';
import { masks } from '../src/qr/options/masks.mjs';

const SELF_DIR = dirname(fileURLToPath(import.meta.url));

const size = 12;
const options = {
  on: [255, 255, 255],
  off: [0, 0, 0],
  padX: 0,
  padY: 0,
  scale: 1,
};

for (let i = 0; i < masks.length; ++i) {
  const path = join(SELF_DIR, '..', 'web', 'resources', `mask${i}.png`);

  await writeFile(
    path,
    toPngBuffer({ size, get: (x, y) => !masks[i](x, y) }, options),
  );
}
