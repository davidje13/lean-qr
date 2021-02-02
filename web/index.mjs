import { correction, mode, generate } from '../src/index.mjs';

function encode(content) {
  if (/^[0-9]*$/.test(content)) {
    return mode.numeric(content);
  }
  if (/^[0-9A-Z $%*+./:-]*$/.test(content)) {
    return mode.alphaNumeric(content);
  }
  return mode.iso8859_1(content);
}

function getValue(name) {
  return document.querySelector(`[name="${name}"]`).value;
}

function getInt(name) {
  return Math.round(Number(getValue(name)));
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
    const code = generate(encode(getValue('message')), {
      minVersion: getInt('min-version'),
      maxVersion: getInt('max-version'),
      minCorrectionLevel: correction[getValue('min-correction')],
      maxCorrectionLevel: correction[getValue('max-correction')],
      mask: getMask(),
    });
    code.toCanvas(output);
    err.style.display = 'none';
    output.style.display = 'block';
  } catch (e) {
    err.innerText = e.message;
    err.style.display = 'block';
    output.style.display = 'none';
  }
}

document.querySelectorAll('input, select, textarea').forEach((o) => o.addEventListener('input', regenerate));

regenerate();
