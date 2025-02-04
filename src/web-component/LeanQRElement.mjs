import { generate, mode } from '../index.mjs';
import { listen, parseCol } from './utils.mjs';
import { Watcher } from './Watcher.mjs';

const MODE_LOOKUP = new Map([
  ['numeric', mode.numeric],
  ['alphanumeric', mode.alphaNumeric],
  ['ascii', mode.ascii],
  ['iso8859_1', mode.iso8859_1],
  ['shift_jis', mode.shift_jis],
  ['utf8', mode.utf8],
]);

const parseInt = Number.parseInt;

const ATTRS = [
  ['minCorrectionLevel', 'min-correction-level'],
  ['maxCorrectionLevel', 'max-correction-level'],
  ['minVersion', 'min-version', parseInt],
  ['maxVersion', 'max-version', parseInt],
  ['mask', 'mask', parseInt],
  [
    'modes',
    'modes',
    (v) => v.matchAll(/\w+/g).map(([m]) => MODE_LOOKUP.get(m)),
  ],
  ['on', 'on', parseCol],
  ['off', 'off', parseCol],
  ['padX', 'pad-x', parseInt],
  ['padY', 'pad-y', parseInt],
];

export class LeanQRElement extends HTMLElement {
  static observedAttributes = ['for', 'value', ...ATTRS.map((v) => v[1])];

  constructor() {
    super();
    this._lastRendered = [];
    this._watcher = new Watcher(
      () => this.attributeChangedCallback(),
      ['value', 'href', 'innerText'],
    );
    const canvas = this.ownerDocument.createElement('canvas');
    this._canvas = canvas;
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.imageRendering = 'pixelated';
    this.setAttribute('role', 'img');
    this.attachShadow({ mode: 'closed' }).append(canvas);
  }

  connectedCallback() {
    this._disconnect = listen(this._canvas, ['contextrestored'], () => {
      this._lastRendered = [];
      this._render();
    });
    this._render();
  }

  disconnectedCallback() {
    this._disconnect?.();
    this._disconnect = null;
    this._watcher.stop();
  }

  attributeChangedCallback() {
    this._dirty = true;
    // deduplicate multiple attributes changing in a single frame
    Promise.resolve().then(() => {
      if (this._dirty) {
        this._render();
      }
    });
  }

  _render() {
    this._dirty = false;
    if (!this.ownerDocument.defaultView) {
      return;
    }
    const forId = this.getAttribute('for');
    const target = forId ? this.ownerDocument.getElementById(forId) : null;
    const msg = this._watcher.get(target) ?? this.getAttribute('value') ?? '';
    const options = { msg };
    for (const [k, a, f] of ATTRS) {
      const v = this.getAttribute(a);
      if (v) {
        options[k] = f ? f(v) : v;
      }
    }
    const check = Object.entries(options).flat(2);
    if (
      check.length !== this._lastRendered.length ||
      this._lastRendered.some((k, v) => check[k] !== v)
    ) {
      const canvas = this._canvas;
      try {
        const code = generate(msg, options);
        code.toCanvas(canvas, options);
        this.style.aspectRatio = `${canvas.width} / ${canvas.height}`;
      } catch (e) {
        console.error('QR code rendering failed', e);
        canvas.getContext('2d').clearRect(0, 0, 200, 200);
      }
      this.setAttribute('aria-label', `QR code for "${msg}"`);
      this.setAttribute('title', msg);
      this._lastRendered = check;
    }
  }
}
