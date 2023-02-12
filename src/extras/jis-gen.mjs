#!/usr/bin/env node

import iconv from 'iconv-lite';

// this is a dev tool for generating the compressed data used in jis.mjs

const map = new Map();
populateMapping(map, 0x8140, 0x9ffd);
populateMapping(map, 0xe040, 0xebc0);
const data = writeCompressed(map)
  .replaceAll('\\', '\\\\')
  .replaceAll('"', '\\"');
process.stdout.write(`const UNICODE_MAPPING_COMPRESSED =\n  "${data}";\n`);
process.stderr.write(`${data.length} bytes\n`);

function populateMapping(target, from, to) {
  const b = Buffer.alloc(2);
  for (let c = from; c < to; ++c) {
    b[0] = c >> 8;
    b[1] = c & 0xff;
    const s = iconv.decode(b, 'Shift_JIS');
    const ucode = s.charCodeAt(0); // all are representable in the BMP
    if (ucode === 0xfffd) {
      continue; // value is not defined in Shift_JIS
    }
    let encoded = c - 0x8140;
    if (encoded >= 0x5f00) {
      encoded -= 0x4000;
    }
    encoded = (encoded >> 8) * 0xc0 + (encoded & 0xff);
    if (target.has(ucode)) {
      const existing = target.get(ucode);
      process.stderr.write(
        `Conflict! ${s} -> ${p16(encoded, 4)} & ${p16(existing, 4)}\n`,
      );
    } else {
      target.set(ucode, encoded);
      //const bits = encoded.toString(2).padStart(13, '0');
      //process.stderr.write(
      //  `\\u${p16(ucode, 4)} -> 0x${p16(c)} -> ${bits} ${s}\n`,
      //);
    }
  }
}

function writeCompressed(mapping) {
  // counterpart to readCompressed in jis.mjs
  let u = 0;
  let t = 0;
  let rep = 1;
  let data = '';
  for (const unicode of [...mapping.keys()].sort((a, b) => a - b)) {
    const target = mapping.get(unicode);
    if (unicode === u + 1 && target === t + 1) {
      ++rep;
    } else {
      if (rep > 1) {
        data += '!' + compressNum(rep, 1);
      }
      let du = compressNum(unicode - u - 1) || '#';
      if (du.length > 3) {
        throw new Error('large delta!');
      }
      data += ['', '', ' ', '  '][du.length] + du + compressNum(target, 2);
      rep = 1;
    }
    u = unicode;
    t = target;
  }
  if (rep > 1) {
    data += '!' + compressNum(rep, 1);
  }
  return data;
}

function p16(v, l = 0) {
  return v.toString(16).padStart(l, '0');
}

function compressNum(v, l = 0) {
  // counterpart to decompressNum in jis.mjs
  if (v < 0) {
    throw new Error('negative value!');
  }
  const r = [];
  const charsetSize = 92; // ASCII # -- ~ (reserve ' ', '!', '"' for control characters)
  for (let i = 0; i < l || (!l && v); ++i) {
    r.push(String.fromCharCode((v % charsetSize) + 35));
    v = Math.floor(v / charsetSize);
  }
  if (v) {
    throw new Error('value out of bounds!');
  }
  return r.reverse().join('');
}
