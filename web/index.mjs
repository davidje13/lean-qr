import { correction, generate, mode } from '../src/index.mjs';
import { toSvgDataURL } from '../src/extras/svg.mjs';
import { toPngDataURL, toPngBytes } from '../src/extras/png.mjs';
import { readError } from '../src/extras/errors.mjs';

const getInput = (name) => document.querySelector(`[name="${name}"]`);
const getValue = (name) => getInput(name).value;

function getInt(name, min, max) {
  const v = Number.parseInt(getValue(name), 10);
  if (Number.isNaN(v)) {
    return min;
  }
  return Math.max(min, Math.min(max, v));
}

function getData(name, min, max) {
  const raw = getValue(name)
    .toLowerCase()
    .replace(/[^0-9a-f]/g, '');
  const v = Number.parseInt(raw, 16);
  if (Number.isNaN(v)) {
    return min;
  }
  return Math.max(min, Math.min(max, v));
}

function getColour(name) {
  const rgb = Number.parseInt(getValue(name).slice(1), 16);
  return [(rgb >> 16) & 0xff, (rgb >> 8) & 0xff, rgb & 0xff, 0xff];
}

function getMask() {
  const raw = getValue('mask');
  if (raw === 'auto') {
    return null;
  }
  return Number(raw);
}

const err = document.getElementById('error');
const qrCanvas = document.querySelector('#qr');
const downloadPng = document.querySelector('#download .png');
const downloadSvg = document.querySelector('#download .svg');
const share = document.querySelector('#download .share');
const modes = [
  { mode: mode.numeric, input: getInput('mode-numeric') },
  { mode: mode.alphaNumeric, input: getInput('mode-alphanumeric') },
  { mode: mode.ascii, input: getInput('mode-ascii') },
  { mode: mode.iso8859_1, input: getInput('mode-iso88591') },
  { mode: mode.shift_jis, input: getInput('mode-sjis') },
  { mode: mode.utf8, input: getInput('mode-utf8') },
];

let latestCode = null;
let latestOptions = '';

function regenerate() {
  try {
    const options = {
      message: getValue('message'),
      minVersion: getInt('min-version', 1, 40),
      maxVersion: getInt('max-version', 1, 40),
      minCorrectionLevel: getValue('min-correction'),
      maxCorrectionLevel: getValue('max-correction'),
      mask: getMask(),
      trailer: getData('trailer', 0x0000, 0xffff),
      modes: modes
        .map(({ input }, i) => (input.checked ? i : -1))
        .filter((i) => i !== -1),
    };
    if (JSON.stringify(options) !== latestOptions) {
      latestCode = generate(options.message, {
        ...options,
        minCorrectionLevel: correction[options.minCorrectionLevel],
        maxCorrectionLevel: correction[options.maxCorrectionLevel],
        modes: options.modes.map((i) => modes[i].mode),
      });
      latestOptions = JSON.stringify(options);
    }
    downloadPng.setAttribute('href', '#');
    downloadSvg.setAttribute('href', '#');

    latestCode.toCanvas(qrCanvas, {
      on: getColour('on'),
      off: getColour('off'),
    });
    document.body.className = 'success';
  } catch (e) {
    err.innerText = readError(e);
    document.body.className = 'error';
    latestCode = null;
    latestOptions = '';
  }
}

downloadPng.addEventListener('click', async (e) => {
  if (e.currentTarget.getAttribute('href') === '#') {
    e.preventDefault();
    if (!latestCode) {
      return;
    }
    const url = await toPngDataURL(latestCode, {
      on: getColour('on'),
      off: getColour('off'),
      scale: getInt('scale', 1, Number.POSITIVE_INFINITY),
    });
    e.currentTarget.setAttribute('href', url);
    e.currentTarget.click();
  }
});

downloadSvg.addEventListener('click', (e) => {
  if (e.currentTarget.getAttribute('href') === '#') {
    if (!latestCode) {
      e.preventDefault();
      return;
    }
    const url = toSvgDataURL(latestCode, {
      on: getValue('on'),
      off: getValue('off'),
      scale: getInt('scale', 1, Number.POSITIVE_INFINITY),
    });
    e.currentTarget.setAttribute('href', url);
  }
});

if (
  navigator.canShare?.({
    files: [new File([], 'test.png', { type: 'image/png' })],
  })
) {
  share.style.display = 'inline-block';
  function doShare(e) {
    e.preventDefault();
    if (!latestCode) {
      return;
    }
    toPngBytes(latestCode, {
      on: getColour('on'),
      off: getColour('off'),
      scale: getInt('scale', 1, Number.POSITIVE_INFINITY),
    })
      .then((data) =>
        navigator.share({
          title: getValue('message'),
          files: [new File([data], 'qr-code.png', { type: 'image/png' })],
        }),
      )
      .catch(() => null);
  }
  share.addEventListener('click', doShare);
  qrCanvas.addEventListener('click', doShare);
  qrCanvas.style.cursor = 'pointer';
}

document
  .querySelectorAll('input, select, textarea')
  .forEach((o) => o.addEventListener('input', regenerate));
document.getElementById('reverse-col').addEventListener('click', () => {
  const on = getInput('on');
  const off = getInput('off');
  const onV = on.value;
  const offV = off.value;
  on.value = offV;
  off.value = onV;
  regenerate();
});

regenerate();
