import { getFormData, Router } from 'web-listener';
import { correction, generate, mode } from '../src/index.mjs';
import { toSvgSource } from '../src/extras/svg.mjs';
import { toPngBuffer, toPngDataURL } from '../src/extras/node_export.mjs';
import { readError } from '../src/extras/errors.mjs';

const router = new Router();
export default router;

router.get('/preview.html', (_, res) => {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.end(htmlFrame(['<body class="output"></body>']), 'utf-8');
});

router.post('/preview.html', async (req, res) => {
  res.setHeader('content-type', 'text/html; charset=utf-8');
  res.setHeader('cache-control', 'no-cache, no-store, max-age=0');

  const { qr, on, off } = await readForm(req);
  const png = toPngDataURL(qr, { on: getColour(on), off: getColour(off) });

  res.end(
    htmlFrame([
      '<body class="output success">',
      `<img id="qr" class="qr" src="${encodeHTML(png)}" aria-label="QR Code" />`,
      '</body>',
    ]),
    'utf-8',
  );
});

router.post('/qr-code.png', async (req, res) => {
  res.setHeader('content-type', 'image/png');
  res.setHeader('cache-control', 'no-cache, no-store, max-age=0');
  res.setHeader('content-disposition', 'attachment; filename=qr-code.png');

  const { qr, on, off, scale } = await readForm(req);
  res.end(toPngBuffer(qr, { on: getColour(on), off: getColour(off), scale }));
});

router.post('/qr-code.svg', async (req, res) => {
  res.setHeader('content-type', 'image/svg+xml');
  res.setHeader('cache-control', 'no-cache, no-store, max-age=0');
  res.setHeader('content-disposition', 'attachment; filename=qr-code.svg');

  const { qr, on, off, scale } = await readForm(req);
  res.end(toSvgSource(qr, { on, off, scale, xmlDeclaration: true }), 'utf-8');
});

router.onError((err, _, res) => {
  if (!res.response) {
    throw err;
  }
  res.response.setHeader('content-type', 'text/html; charset=utf-8');
  res.response.setHeader('cache-control', 'no-cache, no-store, max-age=0');
  res.response.removeHeader('content-disposition');
  res.response.statusCode = 400;
  res.response.end(
    htmlFrame([
      '<body class="output error">',
      `<p id="error">${encodeHTML(readError(err))}</p>`,
      '</body>',
    ]),
    'utf-8',
  );
});

const htmlFrame = (content) =>
  [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '<meta charset="utf-8" />',
    '<title>Lean QR</title>',
    '<link rel="stylesheet" href="/index.css" />',
    '</head>',
    ...content,
    '</html>',
  ].join('');

const MODE_FIELD_NAMES = [
  ['mode-numeric', mode.numeric],
  ['mode-alphanumeric', mode.alphaNumeric],
  ['mode-ascii', mode.ascii],
  ['mode-iso88591', mode.iso8859_1],
  ['mode-sjis', mode.shift_jis],
  ['mode-utf8', mode.utf8],
];

async function readForm(req) {
  const fields = await getFormData(req, {
    maxContentBytes: 128 * 1024,
    closeAfterErrorDelay: 500,
    maxFields: 32,
    maxFiles: 0,
  });
  const chosenModes = [];
  for (const [field, m] of MODE_FIELD_NAMES) {
    if (fields.getBoolean(field)) {
      chosenModes.push(m);
    }
  }
  const qr = generate(fields.getString('message') ?? '', {
    modes: chosenModes.length > 0 ? chosenModes : null,
    minCorrectionLevel:
      correction[fields.getString('min-correction')] ?? correction.L,
    maxCorrectionLevel:
      correction[fields.getString('max-correction')] ?? correction.H,
    minVersion: getInt(fields.getString('min-version') ?? '1', 1, 40),
    maxVersion: getInt(fields.getString('max-version') ?? '40', 1, 40),
    mask: getMask(fields.getString('mask') ?? 'auto'),
    trailer: getData(fields.getString('trailer') ?? 'EC11', 0x0000, 0xffff),
  });

  const on = fields.getString('on') ?? '#000000';
  const off = fields.getString('off') ?? '#FFFFFF';
  if (!COL.test(on) || !COL.test(off)) {
    throw new Error('invalid colour');
  }
  const scale = getInt(fields.getString('scale') ?? '10', 1, 32);
  return { qr, on, off, scale };
}

function getInt(value, min, max) {
  const v = Number.parseInt(value.trim(), 10);
  if (Number.isNaN(v)) {
    return min;
  }
  return Math.max(min, Math.min(max, v));
}

function getData(value, min, max) {
  const raw = value.toLowerCase().replace(/[^0-9a-f]/g, '');
  const v = Number.parseInt(raw, 16);
  if (Number.isNaN(v)) {
    return min;
  }
  return Math.max(min, Math.min(max, v));
}

const COL = /^#[0-9a-f]{6}$/i;

function getColour(value) {
  const rgb = Number.parseInt(value.slice(1), 16);
  return [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff, 0xff];
}

const getMask = (value) => (value === 'auto' ? null : getInt(value, 0, 7));

const encodeHTML = (v) =>
  v
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
