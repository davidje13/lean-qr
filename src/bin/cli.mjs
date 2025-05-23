#!/usr/bin/env node

import { mode, correction, generate } from '../index.mjs';
import { toSvgDataURL, toSvgSource } from '../extras/svg.mjs';
import { toPngBuffer, toPngDataURL } from '../extras/node_export.mjs';
import { readError } from '../extras/errors.mjs';
import { printUsage, parseArgs } from './argparser.mjs';

const ENCODINGS = new Map();
ENCODINGS.set('auto', mode.auto);
ENCODINGS.set('numeric', mode.numeric);
ENCODINGS.set('alphanumeric', mode.alphaNumeric);
ENCODINGS.set('ascii', mode.ascii);
ENCODINGS.set('iso-8859-1', mode.iso8859_1);
ENCODINGS.set('shift-jis', mode.shift_jis);
ENCODINGS.set('utf8', mode.utf8);

const TEXT_FORMATS = new Map();
TEXT_FORMATS.set('text-ansi-invert', { on: '\u001B[7m  \u001B[0m' });
TEXT_FORMATS.set('text-ansi-bw', {
  on: '\u001B[40m  ',
  off: '\u001B[107m  ',
  lf: '\u001B[0m\n',
});
TEXT_FORMATS.set('text-ansi-wb', {
  on: '\u001B[107m  ',
  off: '\u001B[40m  ',
  lf: '\u001B[0m\n',
});
TEXT_FORMATS.set('text-box', { on: '\u2588\u2588' });
TEXT_FORMATS.set('text-ascii', {});

const FLAGS = [
  {
    id: 'encoding',
    name: 'encoding',
    short: 'e',
    type: 'enum',
    values: [...ENCODINGS.keys()],
    def: 'auto',
    info: 'Set the encoding type for the content',
  },
  {
    id: 'minCor',
    name: 'min-correction',
    short: 'c',
    type: 'enum',
    values: [...Object.keys(correction)],
    def: 'min',
    info: 'Set the minimum error correction level',
  },
  {
    id: 'maxCor',
    name: 'max-correction',
    short: 'C',
    type: 'enum',
    values: [...Object.keys(correction)],
    def: 'max',
    info: 'Set the maximum error correction level',
  },
  {
    id: 'minVer',
    name: 'min-version',
    short: 'v',
    type: 'int',
    min: 1,
    max: 40,
    def: 1,
    info: 'Set the minimum version (size)',
  },
  {
    id: 'maxVer',
    name: 'max-version',
    short: 'V',
    type: 'int',
    min: 1,
    max: 40,
    def: 40,
    info: 'Set the maximum version (size)',
  },
  {
    id: 'padding',
    name: 'padding',
    short: 'p',
    type: 'int',
    min: 0,
    def: 4,
    info: 'Set the edge padding size',
  },
  {
    id: 'mask',
    name: 'mask',
    short: 'm',
    type: 'enum',
    values: ['auto', '0', '1', '2', '3', '4', '5', '6', '7'],
    def: 'auto',
    info: 'Set the masking type (advanced usage)',
  },
  {
    id: 'trailer',
    name: 'trailer',
    short: 't',
    type: 'hex',
    length: 4,
    min: 0x0000,
    max: 0xffff,
    def: 0xec11,
    info: 'Set the trailer data (advanced usage)',
  },
  {
    id: 'format',
    name: 'format',
    short: 'f',
    type: 'enum',
    values: [
      ...TEXT_FORMATS.keys(),
      'svg',
      'svg-data-url',
      'png',
      'png-data-url',
    ],
    def: 'text-ansi-invert',
    info: 'Set the output format',
  },
  {
    id: 'scale',
    name: 'scale',
    short: 's',
    type: 'int',
    min: 1,
    def: 8,
    info: 'Set the image scale for PNG exports (ignored if not using PNG)',
  },
  {
    id: 'info',
    name: 'info',
    short: 'i',
    type: 'presence',
    info: 'Print meta information to stderr',
  },
  {
    id: 'help',
    name: 'help',
    short: '?',
    type: 'presence',
    info: 'Print documentation',
  },
];

const SVG_OPTIONS = {
  on: 'black',
  off: 'white',
  xmlDeclaration: true,
};

const PNG_OPTIONS = {
  on: [0, 0, 0],
  off: [255, 255, 255],
};

try {
  const args = parseArgs(FLAGS, process.argv);
  if (args.help) {
    printUsage('lean-qr', 'CLI for generating a QR code', FLAGS, 'content');
    process.exit(0);
  }

  const encoding = ENCODINGS.get(args.encoding.toLowerCase());
  if (!encoding) {
    throw new Error('Unknown encoding type');
  }

  let formatter;
  if (args.format === 'svg') {
    formatter = (code, options) =>
      toSvgSource(code, { ...SVG_OPTIONS, ...options }) + '\n';
  } else if (args.format === 'svg-data-url') {
    formatter = (code, options) =>
      toSvgDataURL(code, { ...SVG_OPTIONS, ...options }) + '\n';
  } else if (args.format === 'png') {
    formatter = (code, options) =>
      toPngBuffer(code, { ...PNG_OPTIONS, scale: args.scale, ...options });
  } else if (args.format === 'png-data-url') {
    formatter = (code, options) =>
      toPngDataURL(code, { ...PNG_OPTIONS, scale: args.scale, ...options }) +
      '\n';
  } else if (TEXT_FORMATS.has(args.format)) {
    formatter = (code, options) =>
      code.toString({ ...TEXT_FORMATS.get(args.format), ...options });
  } else {
    throw new Error('Unknown output format');
  }

  const content = args.rest;

  const tm0 = Date.now();
  const encoded = encoding(content);

  const tm1 = Date.now();
  const code = generate(encoded, {
    minCorrectionLevel: correction[args.minCor],
    maxCorrectionLevel: correction[args.maxCor],
    minVersion: args.minVer,
    maxVersion: args.maxVer,
    mask: args.mask === 'auto' ? null : Number(args.mask),
    trailer: args.trailer,
  });

  const tm2 = Date.now();
  const result = formatter(code, { padX: args.padding, padY: args.padding });

  const tm3 = Date.now();
  process.stdout.write(result);

  if (args.info) {
    process.stderr.write('Time taken:\n');
    process.stderr.write(`  encode: ${tm1 - tm0}ms\n`);
    process.stderr.write(`  generate: ${tm2 - tm1}ms\n`);
    process.stderr.write(`  format: ${tm3 - tm2}ms\n`);
  }
} catch (e) {
  process.stderr.write(`${readError(e)}\n\n`);
  process.exit(1);
}

// lean-qr 'LEAN-QR LIBRARY'
// lean-qr -cQ 'HELLO WORLD'
// lean-qr -cQ -m1 'http://en.m.wikipedia.org'
