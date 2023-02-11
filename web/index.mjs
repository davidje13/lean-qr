import { correction, generate } from '../src/index.mjs';
import { toSvg, toSvgDataURL } from '../src/extras/svg.mjs';

const getInput = (name) => document.querySelector(`[name="${name}"]`);
const getValue = (name) => getInput(name).value;
const getInt = (name) => Math.round(Number.parseInt(getValue(name), 10));

function getColour(name) {
  const rgb = Number.parseInt(getValue(name).substr(1), 16);
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
const outputCanvas = document.querySelector('#output canvas');
const outputText = document.querySelector('#output pre');
const outputSvg = document.querySelector('#output svg');
const downloadPng = document.querySelector('#download .png');
const downloadSvg = document.querySelector('#download .svg');

let latestCode = null;

function regenerate() {
  latestCode = null;
  outputCanvas.style.display = 'none';
  outputText.style.display = 'none';
  outputSvg.style.display = 'none';
  err.style.display = 'none';
  downloadPng.removeAttribute('href');
  downloadSvg.removeAttribute('href');

  try {
    const code = generate(getValue('message'), {
      minVersion: getInt('min-version'),
      maxVersion: getInt('max-version'),
      minCorrectionLevel: correction[getValue('min-correction')],
      maxCorrectionLevel: correction[getValue('max-correction')],
      mask: getMask(),
    });
    latestCode = code;
    downloadPng.setAttribute('href', '#');
    downloadSvg.setAttribute('href', '#');

    switch (getValue('format')) {
      case 'canvas':
        code.toCanvas(outputCanvas, {
          on: getColour('on'),
          off: getColour('off'),
        });
        outputCanvas.style.display = 'block';
        break;
      case 'text':
        outputText.innerText = code.toString({ on: '\u2588\u2588', off: '  ' });
        outputText.style.color = getValue('on');
        outputText.style.background = getValue('off');
        outputText.style.transform = `scale(${(21 + 8) / (code.size + 8)})`;
        outputText.style.display = 'inline-block';
        break;
      case 'svg':
        toSvg(code, outputSvg, { on: getValue('on'), off: getValue('off') });
        outputSvg.style.display = 'block';
        break;
    }
  } catch (e) {
    err.innerText = e.message;
    err.style.display = 'block';
  }
}

downloadPng.addEventListener('click', (e) => {
  if (!latestCode) {
    e.preventDefault();
    return;
  }
  const url = latestCode.toDataURL({
    type: 'image/png',
    on: getColour('on'),
    off: getColour('off'),
    scale: 10,
  });
  downloadPng.setAttribute('href', url);
});

downloadSvg.addEventListener('click', (e) => {
  if (!latestCode) {
    e.preventDefault();
    return;
  }
  const url = toSvgDataURL(latestCode, {
    on: getValue('on'),
    off: getValue('off'),
    scale: 10,
  });
  downloadSvg.setAttribute('href', url);
});

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
