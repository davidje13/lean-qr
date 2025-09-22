import { makeVueCanvasComponent, makeVueSvgComponent } from './vue.mjs';
import { generate } from '../index.mjs';
import { toSvgDataURL } from './svg.mjs';
import {
  createApp,
  defineComponent,
  h,
} from '@vue/runtime-dom/dist/runtime-dom.esm-browser.js';

// Note: vue breaks if its bundle is re-minified, so this test runs without terser applied.

const framework = { h };

describe('makeVueCanvasComponent', () => {
  it('creates a vue-compatible component', ({ getTyped }) => {
    const Component = defineComponent(
      makeVueCanvasComponent(framework, generate),
    );

    const { container } = getTyped(MOUNT)(Component, [{ content: 'TEST' }]);

    const canvas = container.querySelector('canvas');
    expect(canvas).isTruthy();
    expect(canvas.width).equals(29);
  });

  it('updates if content changes', async ({ getTyped }) => {
    const spyGenerate = mock(generate);
    const Component = makeVueCanvasComponent(framework, spyGenerate);

    const { container, advance } = getTyped(MOUNT)(Component, [
      { content: 'TEST' },
      { content: 'content that needs more space' },
    ]);

    const canvas = container.querySelector('canvas');
    expect(canvas.width).equals(29);
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });

    await advance();
    expect(canvas.width).equals(33);
    expect(spyGenerate).toHaveBeenCalled({ times: 2 });
  });

  it('accepts generate config and updates if changed', async ({ getTyped }) => {
    const spyGenerate = mock(generate);
    const Component = makeVueCanvasComponent(framework, spyGenerate);

    const { container, advance } = getTyped(MOUNT)(Component, [
      { content: 'TEST', minVersion: 10 },
      { content: 'TEST', minVersion: 20 },
    ]);

    const canvas = container.querySelector('canvas');
    expect(canvas.width).equals(65);
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });

    await advance();
    expect(canvas.width).equals(105);
    expect(spyGenerate).toHaveBeenCalled({ times: 2 });
  });

  it('accepts toCanvas config and updates if changed', async ({ getTyped }) => {
    const spyGenerate = mock(generate);
    const Component = makeVueCanvasComponent(framework, spyGenerate);

    const { container, advance } = getTyped(MOUNT)(Component, [
      { content: 'TEST', padX: 2 },
      { content: 'TEST', padX: 10 },
    ]);

    const canvas = container.querySelector('canvas');
    expect(canvas.width).equals(25);
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });

    await advance();
    expect(canvas.width).equals(41);
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });
  });

  it('uses default config for missing properties', async ({ getTyped }) => {
    const Component = makeVueCanvasComponent(framework, generate, {
      minVersion: 10,
    });

    const { container, advance } = getTyped(MOUNT)(Component, [
      { content: 'TEST' },
      { content: 'TEST', minVersion: 20 },
    ]);

    const canvas = container.querySelector('canvas');
    expect(canvas.width).equals(65);

    await advance();
    expect(canvas.width).equals(105);
  });

  it('handles errors without exploding', ({ getTyped }) => {
    mock(console, 'warn');
    const Component = makeVueCanvasComponent(framework, generate);

    const { container } = getTyped(MOUNT)(Component, [
      { content: 'TEST', minVersion: 42 },
    ]);

    const canvas = container.querySelector('canvas');
    expect(canvas.hidden).isTrue();
    expect(console.warn).toHaveBeenCalledWith('lean-qr error 2');
  });
});

describe('makeVueSvgComponent', () => {
  it('creates a vue-compatible component', ({ getTyped }) => {
    const Component = makeVueSvgComponent(framework, generate, toSvgDataURL);

    const { container } = getTyped(MOUNT)(Component, [{ content: 'TEST' }]);

    const img = container.querySelector('img');
    expect(img).isTruthy();
    expect(img.src).startsWith('data:image/svg+xml;base64,');
  });

  it('updates if content changes', async ({ getTyped }) => {
    const spyGenerate = mock(generate);
    const Component = makeVueSvgComponent(framework, spyGenerate, toSvgDataURL);

    const { container, advance } = getTyped(MOUNT)(Component, [
      { content: 'TEST' },
      { content: 'other content' },
    ]);

    const img = container.querySelector('img');
    const content1 = img.src;
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });

    await advance();
    expect(img.src).not(equals(content1));
    expect(spyGenerate).toHaveBeenCalled({ times: 2 });
  });

  it('updates if toSVGDataURL config changs', async ({ getTyped }) => {
    const spyGenerate = mock(generate);
    const Component = makeVueSvgComponent(framework, spyGenerate, toSvgDataURL);

    const { container, advance } = getTyped(MOUNT)(Component, [
      { content: 'TEST', padX: 2 },
      { content: 'TEST', padX: 10 },
    ]);

    const img = container.querySelector('img');
    const content1 = img.src;
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });

    await advance();
    expect(img.src).not(equals(content1));
    expect(spyGenerate).toHaveBeenCalled({ times: 1 });
  });

  it('handles errors without exploding', ({ getTyped }) => {
    mock(console, 'warn');
    const Component = makeVueSvgComponent(framework, generate, toSvgDataURL);

    const { container } = getTyped(MOUNT)(Component, [
      { content: 'TEST', minVersion: 42 },
    ]);

    const img = container.querySelector('img');
    expect(img).isFalsy();
    expect(console.warn).toHaveBeenCalledWith('lean-qr error 2');
  });
});

const MOUNT = beforeEach(({ setParameter }) => {
  const container = document.createElement('div');
  document.body.appendChild(container);
  let app = null;
  setParameter((Component, propsSequence) => {
    app?.unmount();

    app = createApp({
      data: () => ({ n: 0 }),
      render() {
        return h('div', [
          h(Component, propsSequence[this.n]),
          h('button', { onClick: () => this.n++ }, 'Change'),
        ]);
      },
    });
    app.mount(container);

    return {
      container,
      app,
      advance: () => {
        container.querySelector('button').click();
        return Promise.resolve();
      },
    };
  });

  return () => {
    app?.unmount();
    document.body.removeChild(container);
  };
});
