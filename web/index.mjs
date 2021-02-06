import { correction, generate } from '../src/index.mjs';

function getInput(name) {
  return document.querySelector(`[name="${name}"]`);
}

function getValue(name) {
  return getInput(name).value;
}

function getInt(name) {
  return Math.round(Number.parseInt(getValue(name), 10));
}

function getColour(name) {
  const rgb = Number.parseInt(getValue(name).substr(1), 16);
  const r = (rgb >> 16) & 0xFF;
  const g = (rgb >> 8) & 0xFF;
  const b = rgb & 0xFF;
  return 0xFF000000 | (b << 16) | (g << 8) | r;
}

function getMask() {
  const raw = getValue('mask');
  if (raw === 'auto') {
    return null;
  }
  return Number(raw);
}

function regenerate() {
  const err = document.getElementById('error');
  const output = document.querySelector('#output');
  try {
    const code = generate(getValue('message'), {
      minVersion: getInt('min-version'),
      maxVersion: getInt('max-version'),
      minCorrectionLevel: correction[getValue('min-correction')],
      maxCorrectionLevel: correction[getValue('max-correction')],
      mask: getMask(),
    });
    code.toCanvas(output, { on: getColour('on'), off: getColour('off') });
    output.style.background = getValue('off');
    err.style.display = 'none';
    output.style.display = 'block';
  } catch (e) {
    err.innerText = e.message;
    err.style.display = 'block';
    output.style.display = 'none';
  }
}

document.querySelectorAll('input, select, textarea').forEach((o) => o.addEventListener('input', regenerate));
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
