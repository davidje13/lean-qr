#!/usr/bin/env node

import { text } from 'node:stream/consumers';

const content = JSON.parse(await text(process.stdin));

delete content.private;
delete content.scripts;
delete content.devDependencies;

process.stdout.write(JSON.stringify(content, null, 2), 'utf-8');
