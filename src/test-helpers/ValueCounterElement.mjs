export class ValueCounterElement extends HTMLElement {
  constructor() {
    super();
    this.count = 0;
  }

  get value() {
    ++this.count;
    return this.getAttribute('value');
  }
}

customElements.define('value-counter', ValueCounterElement);
