import { LeanQRElement } from './index.mjs';

describe('LeanQRElement', () => {
  it('registers a lean-qr tag', async () => {
    const c = render('<lean-qr value="hello"></lean-qr>');
    const el = c.querySelector('lean-qr');
    expect(el).toBeInstanceOf(LeanQRElement);

    await nextFrame();
    expect(el.getAttribute('title')).toEqual('hello');
  });

  it('sets accessibility properties', async () => {
    const c = render('<lean-qr value="hello"></lean-qr>');
    const el = c.querySelector('lean-qr');

    await nextFrame();
    expect(el.getAttribute('role')).toEqual('img');
    expect(el.getAttribute('aria-label')).toEqual('QR code for "hello"');
  });

  it('sets styles', async () => {
    const c = render('<lean-qr value="hello" pad-x="2"></lean-qr>');
    const el = c.querySelector('lean-qr');

    await nextFrame();
    expect(getComputedStyle(el).aspectRatio).toEqual('25 / 29');
  });

  it('can source content from another element', async () => {
    const c = render(`
      <div id="source">My message</div>
      <lean-qr for="source"></lean-qr>
    `);
    await nextFrame();
    expect(c.querySelector('lean-qr').getAttribute('title')).toEqual(
      'My message',
    );
  });

  it('can source content from later elements in the page', async () => {
    const c = render(`
      <lean-qr for="source"></lean-qr>
      <div id="source">My message</div>
    `);
    await nextFrame();
    expect(c.querySelector('lean-qr').getAttribute('title')).toEqual(
      'My message',
    );
  });

  it('uses source element value if available', async () => {
    const c = render(`
      <input type="text" id="source" value="Stuff" />
      <lean-qr for="source"></lean-qr>
    `);
    await nextFrame();
    expect(c.querySelector('lean-qr').getAttribute('title')).toEqual('Stuff');
  });

  it('uses source element href if available', async () => {
    const c = render(`
      <a href="https://example.com/foo" id="source">My link</a>
      <lean-qr for="source"></lean-qr>
    `);
    await nextFrame();
    expect(c.querySelector('lean-qr').getAttribute('title')).toEqual(
      'https://example.com/foo',
    );
  });

  it('uses source inner text as fallback', async () => {
    const c = render(`
      <a id="source">My anchor</a>
      <lean-qr for="source"></lean-qr>
    `);
    await nextFrame();
    expect(c.querySelector('lean-qr').getAttribute('title')).toEqual(
      'My anchor',
    );
  });

  it('updates automatically when attributes change', async () => {
    const c = render('<lean-qr value="message 1"></lean-qr>');
    const el = c.querySelector('lean-qr');

    await nextFrame();
    expect(el.getAttribute('title')).toEqual('message 1');

    el.setAttribute('value', 'message 2');
    await nextFrame();
    expect(el.getAttribute('title')).toEqual('message 2');
  });

  it('updates automatically when source content changes', async () => {
    const c = render(`
      <div id="source">message 1</div>
      <lean-qr for="source"></lean-qr>
    `);
    const source = c.querySelector('#source');
    const el = c.querySelector('lean-qr');

    await nextFrame();
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

    await nextFrame();
    expect(el.getAttribute('title')).toEqual('message 1');

    source.value = 'message 2';
    source.dispatchEvent(new CustomEvent('input'));
    await nextFrame();
    expect(el.getAttribute('title')).toEqual('message 2');
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
