import {
  numeric,
  alphaNumeric,
  ascii,
  iso8859_1,
  utf8,
  shift_jis,
} from '../qr/options/modes.mjs';
import { generate } from '../qr/generate.mjs';
import { parseCol } from './utils.mjs';

const MODE_LOOKUP = new Map([
  ['numeric', numeric],
  ['alphanumeric', alphaNumeric],
  ['ascii', ascii],
  ['iso8859_1', iso8859_1],
  ['shift_jis', shift_jis],
  ['utf8', utf8],
]);

const getCorrection = (v) => 'LMQH'.indexOf(v);
const parseInt = Number.parseInt;

// we use Object.entries here so that terser can mangle the property names consistently
const ATTRS = Object.entries({
  minCorrectionLevel: ['min-correction-level', getCorrection],
  maxCorrectionLevel: ['max-correction-level', getCorrection],
  minVersion: ['min-version', parseInt],
  maxVersion: ['max-version', parseInt],
  mask: ['mask', parseInt],
  modes: ['modes', (v) => v.matchAll(/\w+/g).map(([m]) => MODE_LOOKUP.get(m))],
  on: ['on', parseCol],
  off: ['off', parseCol],
  pad: ['pad', parseInt],
  padX: ['pad-x', parseInt],
  padY: ['pad-y', parseInt],
});

export class LeanQRElement extends HTMLElement {
  static observedAttributes = ['for', 'value', ...ATTRS.map((v) => v[1][0])];

  constructor() {
    super();
    this._lastRendered = [];
    this._observer = new MutationObserver(this._changed);
    const canvas = (this._canvas = this.ownerDocument.createElement('canvas'));
    canvas.style.display = 'block';
    canvas.style.width = '100%';
    canvas.style.imageRendering = 'pixelated';
    this.setAttribute('role', 'img');
    this.attachShadow({ mode: 'closed' }).append(canvas);
  }

  connectedCallback() {
    this._canvas.addEventListener('contextrestored', this._contextRestored);
    this._render();
  }

  disconnectedCallback() {
    this._canvas.removeEventListener('contextrestored', this._contextRestored);
    this._stopWatching();
  }

  attributeChangedCallback() {
    this._changed();
  }

  _contextRestored = () => {
    this._lastRendered = [];
    this._render();
  };

  _changed = async () => {
    this._dirty = true;
    await 1; // deduplicate multiple attributes changing in a single frame
    if (this._dirty) {
      this._render();
    }
  };

  _render() {
    this._dirty = false;
    const doc = this.ownerDocument;
    if (!doc.defaultView) {
      return;
    }
    const forId = this.getAttribute('for');
    const target = forId && doc.getElementById(forId);
    const msg = this._getAndWatch(target) ?? this.getAttribute('value') ?? '';
    const options = { msg };
    for (const [key, [attr, mapper]] of ATTRS) {
      const value = this.getAttribute(attr);
      if (value) {
        options[key] = mapper(value);
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

  _getAndWatch(target) {
    if (!target) {
      this._stopWatching();
      return; // undefined
    }
    const targetValue = target.value;
    const value = targetValue ?? (target.href || 0);
    const isContent = value === 0;
    if (target !== this._observing || isContent !== this._observingContent) {
      this._stopWatching();
      this._observer.observe(target, {
        attributes: true,
        attributeFilter: ['id', 'value', 'href'],
      });
      if (isContent) {
        this._observer.observe(target, {
          subtree: true,
          childList: true,
          characterData: true,
        });
      }
      if (targetValue ?? 0 !== 0) {
        target.addEventListener('input', this._changed, { passive: true });
        target.addEventListener('change', this._changed, { passive: true });
      }
      this._observing = target;
      this._observingContent = isContent;
    }
    return isContent ? target.textContent : value;
  }

  _stopWatching() {
    if (this._observing) {
      this._observing.removeEventListener('input', this._changed);
      this._observing.removeEventListener('change', this._changed);
      this._observer.disconnect();
      this._observing = 0;
    }
  }
}

customElements?.define('lean-qr', LeanQRElement);
