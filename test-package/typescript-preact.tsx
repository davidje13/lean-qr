import { correction, generate } from 'lean-qr';
import { makeAsyncComponent, makeSyncComponent } from 'lean-qr/extras/react';
import { toSvgDataURL } from 'lean-qr/extras/svg';
import { createElement, render } from 'preact';
import * as hooks from 'preact/hooks';

// this file just checks types; the code is not executed

const AsyncQRComponent = makeAsyncComponent(
  { createElement, ...hooks },
  generate,
);

const SyncQRComponent = makeSyncComponent(
  { createElement, ...hooks },
  generate,
  toSvgDataURL,
);

render(<AsyncQRComponent content="Hello!" />, document.body);

render(<SyncQRComponent content="Hello!" />, document.body);

render(
  <AsyncQRComponent
    content="Hello!"
    minVersion={1}
    maxVersion={40}
    minCorrectionLevel={correction.L}
    maxCorrectionLevel={correction.H}
    mask={0}
    padX={4}
    padY={4}
    on={[0, 0, 0, 255]}
    off={[255, 255, 255, 255]}
  />,
  document.body,
);

render(
  <SyncQRComponent
    content="Hello!"
    minVersion={1}
    maxVersion={40}
    minCorrectionLevel={correction.L}
    maxCorrectionLevel={correction.H}
    mask={0}
    padX={4}
    padY={4}
    on="#000000"
    off="#FFFFFF"
  />,
  document.body,
);

// @ts-expect-error
makeAsyncComponent(hooks, generate);

// @ts-expect-error
makeAsyncComponent({ createElement }, generate);

// @ts-expect-error
makeAsyncComponent({ createElement, ...hooks }, 'hello');

// @ts-expect-error
render(<AsyncQRComponent />, document.body);

render(
  // @ts-expect-error
  <AsyncQRComponent content="Hello" minCorrectionLevel={-1} />,
  document.body,
);
