import { listen } from './utils.mjs';

export class Watcher {
  constructor(callback) {
    this._mo = new MutationObserver(callback);
    this._callback = callback;
    this._observing = null;
    this._observingCount = 0;
  }

  get(target, fields) {
    if (!target) {
      this.stop();
      return null;
    }
    let value = '';
    let n = 0;
    for (const field of fields) {
      ++n;
      value = target[field];
      if (value !== undefined && (value || field !== 'href')) {
        break;
      }
    }
    if (target !== this._observing || n !== this._observingCount) {
      this.stop();
      const checkedAttrs = fields.slice(0, n);
      this._mo.observe(target, {
        attributes: true,
        attributeFilter: ['id', ...checkedAttrs],
      });
      if (checkedAttrs.includes('innerText')) {
        this._mo.observe(target, {
          subtree: true,
          childList: true,
          characterData: true,
        });
      }
      if (checkedAttrs.includes('value')) {
        this._stop = listen(target, ['input', 'change'], this._callback);
      }
      this._observing = target;
      this._observingCount = n;
    }
    return value;
  }

  stop() {
    if (this._observing) {
      this._stop?.();
      this._mo.disconnect();
      this._observing = null;
      this._stop = null;
    }
  }
}
