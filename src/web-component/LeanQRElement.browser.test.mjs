import { LeanQRElement } from './LeanQRElement.mjs';
import '../test-helpers/ValueCounterElement.mjs';

describe('LeanQRElement', () => {
  it('registers a lean-qr tag', () => {
    const c = render('<lean-qr value="hello"></lean-qr>');
    const el = c.querySelector('lean-qr');
    expect(el).toBeInstanceOf(LeanQRElement);

    expect(el.getAttribute('title')).toEqual('hello');
  });

  it('sets accessibility properties', () => {
    const c = render('<lean-qr value="hello"></lean-qr>');
    const el = c.querySelector('lean-qr');

    expect(el.getAttribute('role')).toEqual('img');
    expect(el.getAttribute('aria-label')).toEqual('QR code for "hello"');
  });

  it('sets styles', () => {
    const c = render('<lean-qr value="hello"></lean-qr>');
    const el = c.querySelector('lean-qr');

    expect(getComputedStyle(el).aspectRatio).toEqual('1 / 1');
  });

  it('can source content from another element', () => {
    const c = render(`
      <div id="source">My message</div>
      <lean-qr for="source"></lean-qr>
    `);
    const el = c.querySelector('lean-qr');

    expect(el.getAttribute('title')).toEqual('My message');
  });

  it('can source content from later elements in the page', () => {
    const c = render(`
      <lean-qr for="source"></lean-qr>
      <div id="source">My message</div>
    `);
    const el = c.querySelector('lean-qr');

    expect(el.getAttribute('title')).toEqual('My message');
  });

  it('uses source element value if available', () => {
    const c = render(`
      <input type="text" id="source" value="Stuff" />
      <lean-qr for="source"></lean-qr>
    `);
    const el = c.querySelector('lean-qr');

    expect(el.getAttribute('title')).toEqual('Stuff');
  });

  it('uses source element href if available', () => {
    const c = render(`
      <a href="https://example.com/foo" id="source">My link</a>
      <lean-qr for="source"></lean-qr>
    `);
    const el = c.querySelector('lean-qr');

    expect(el.getAttribute('title')).toEqual('https://example.com/foo');
  });

  it('uses source inner text as fallback', () => {
    const c = render(`
      <a id="source">My anchor</a>
      <lean-qr for="source"></lean-qr>
    `);
    const el = c.querySelector('lean-qr');

    expect(el.getAttribute('title')).toEqual('My anchor');
  });

  it('updates automatically when attributes change', async () => {
    const c = render('<lean-qr value="message 1"></lean-qr>');
    const el = c.querySelector('lean-qr');

    expect(el.getAttribute('title')).toEqual('message 1');

    el.setAttribute('value', 'message 2');
    await nextTick();
    expect(el.getAttribute('title')).toEqual('message 2');
  });

  it('updates automatically when source content changes', async () => {
    const c = render(`
      <div id="source">message 1</div>
      <lean-qr for="source"></lean-qr>
    `);
    const source = c.querySelector('#source');
    const el = c.querySelector('lean-qr');

    expect(el.getAttribute('title')).toEqual('message 1');

    source.textContent = 'message 2';
    await nextFrame();
    expect(el.getAttribute('title')).toEqual('message 2');
  });

  it('updates automatically when source value changes', async () => {
    const c = render(`
      <input type="text" id="source" value="message 1" />
      <lean-qr for="source"></lean-qr>
    `);
    const source = c.querySelector('#source');
    const el = c.querySelector('lean-qr');

    expect(el.getAttribute('title')).toEqual('message 1');

    source.value = 'message 2';
    source.dispatchEvent(new CustomEvent('input'));
    await nextTick();
    expect(el.getAttribute('title')).toEqual('message 2');
  });

  it('deduplicates changes when multiple attributes change', async () => {
    const c = render(`
      <value-counter id="src" value="hello"></value-counter>
      <lean-qr for="src" pad="4"></lean-qr>
    `);
    const src = c.querySelector('value-counter');
    const el = c.querySelector('lean-qr');

    expect(src.count).toEqual(1);

    el.setAttribute('value', 'message 2');
    el.setAttribute('pad', '8');
    await nextTick();
    expect(src.count).toEqual(2);
  });

  const items = [];
  function render(content) {
    const container = document.createElement('div');
    document.body.append(container);
    container.innerHTML = content;
    items.push(container);
    return container;
  }

  afterEach(() => {
    for (const item of items) {
      item.remove();
    }
    items.length = 0;
  });
});

const nextFrame = () => new Promise((resolve) => setTimeout(resolve, 0));
const nextTick = () => Promise.resolve();
