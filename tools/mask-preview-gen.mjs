#!/usr/bin/env node

import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { toPngBytes } from '../src/extras/png.mjs';
import { masks } from '../src/qr/options/masks.mjs';

const SELF_DIR = dirname(fileURLToPath(import.meta.url));

const size = 12;
const options = { on: [255, 255, 255], off: [0, 0, 0], pad: 0, scale: 1 };

for (let i = 0; i < masks.length; ++i) {
  const path = join(SELF_DIR, '..', 'web', 'resources', `mask${i}.png`);

  await writeFile(
    path,
    await toPngBytes({ size, get: (x, y) => Boolean(masks[i](x, y)) }, options),
  );
}
