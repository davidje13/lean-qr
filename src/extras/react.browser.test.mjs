import { makeAsyncComponent, makeSyncComponent } from './react.mjs';
import { generate } from '../index.mjs';
import { toSvgDataURL } from './svg.mjs';
import { h, render } from 'preact';
import * as hooks from 'preact/hooks';

const framework = { createElement: h, ...hooks };

describe('makeAsyncComponent', () => {
  it('creates a preact-compatible component', async () => {
    const Component = makeAsyncComponent(framework, generate);

    render(h(Component, { content: 'TEST' }), container);

    const canvas = container.querySelector('canvas');
    expect(canvas).isTruthy();
    expect(canvas.width).equals(300); // default canvas size

    await expect.poll(() => canvas.width, equals(29)); // QR code size + padding
  });

  it('updates if content changes', async () => {
    const spyGenerate = mock(generate);
    const Component = makeAsyncComponent(framework, spyGenerate);

    render(h(Component, { content: 'TEST' }), container);

    const canvas = container.querySelector('canvas');
    await expect.poll(() => canvas.width, equals(29));
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });

    render(
      h(Component, { content: 'content that needs more space' }),
      container,
    );
    await expect.poll(() => canvas.width, equals(33));
    expect(spyGenerate).toHaveBeenCalled({ times: 2 });
  });

  it('accepts generate config and updates if changed', async () => {
    const spyGenerate = mock(generate);
    const Component = makeAsyncComponent(framework, spyGenerate);

    render(h(Component, { content: 'TEST', minVersion: 10 }), container);

    const canvas = container.querySelector('canvas');
    await expect.poll(() => canvas.width, equals(65));
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });

    render(h(Component, { content: 'TEST', minVersion: 20 }), container);
    await expect.poll(() => canvas.width, equals(105));
    expect(spyGenerate).toHaveBeenCalled({ times: 2 });
  });

  it('accepts toCanvas config and updates if changed', async () => {
    const spyGenerate = mock(generate);
    const Component = makeAsyncComponent(framework, spyGenerate);

    render(h(Component, { content: 'TEST', padX: 2 }), container);

    const canvas = container.querySelector('canvas');
    await expect.poll(() => canvas.width, equals(25));
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });

    render(h(Component, { content: 'TEST', padX: 10 }), container);
    await expect.poll(() => canvas.width, equals(41));
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });
  });

  it('uses default config for missing properties', async () => {
    const Component = makeAsyncComponent(framework, generate, {
      minVersion: 10,
    });

    render(h(Component, { content: 'TEST' }), container);

    const canvas = container.querySelector('canvas');
    await expect.poll(() => canvas.width, equals(65));

    render(h(Component, { content: 'TEST', minVersion: 20 }), container);
    await expect.poll(() => canvas.width, equals(105));
  });

  it('handles errors without exploding', async () => {
    mock(console, 'warn');
    const Component = makeAsyncComponent(framework, generate);

    render(h(Component, { content: 'TEST', minVersion: 42 }), container);

    const canvas = container.querySelector('canvas');
    await expect.poll(() => canvas.hidden, isTrue());
    expect(console.warn).toHaveBeenCalledWith('lean-qr error 2');
  });
});

describe('makeSyncComponent', () => {
  it('creates a preact-compatible component', () => {
    const Component = makeSyncComponent(framework, generate, toSvgDataURL);

    render(h(Component, { content: 'TEST' }), container);

    const img = container.querySelector('img');
    expect(img).isTruthy();
    expect(img.src).startsWith('data:image/svg+xml;base64,');
  });

  it('updates if content changes', () => {
    const spyGenerate = mock(generate);
    const Component = makeSyncComponent(framework, spyGenerate, toSvgDataURL);

    render(h(Component, { content: 'TEST' }), container);

    const img = container.querySelector('img');
    const content1 = img.src;
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });

    render(h(Component, { content: 'other content' }), container);
    expect(img.src).not(equals(content1));
    expect(spyGenerate).toHaveBeenCalled({ times: 2 });
  });

  it('updates if toSVGDataURL config changs', async () => {
    const spyGenerate = mock(generate);
    const Component = makeSyncComponent(framework, spyGenerate, toSvgDataURL);

    render(h(Component, { content: 'TEST', padX: 2 }), container);

    const img = container.querySelector('img');
    const content1 = img.src;
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });

    render(h(Component, { content: 'TEST', padX: 10 }), container);
    expect(img.src).not(equals(content1));
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });
  });

  it('handles errors without exploding', () => {
    mock(console, 'warn');
    const Component = makeSyncComponent(framework, generate, toSvgDataURL);

    render(h(Component, { content: 'TEST', minVersion: 42 }), container);

    const img = container.querySelector('img');
    expect(img).isFalsy();
    expect(console.warn).toHaveBeenCalledWith('lean-qr error 2');
  });
});

let container;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  render(null, container);
  document.body.removeChild(container);
  container = null;
});
