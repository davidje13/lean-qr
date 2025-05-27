import { correction, generate } from 'lean-qr';
import { generate as generateNano } from 'lean-qr/nano';
import { makeAsyncComponent, makeSyncComponent } from 'lean-qr/extras/react';
import { toSvgDataURL } from 'lean-qr/extras/svg';
import { createElement, render } from 'preact';
import * as hooks from 'preact/hooks';

// this file just checks types; the code is not executed

const framework = { createElement, ...hooks };

const AsyncQRComponent = makeAsyncComponent(framework, generate);
render(<AsyncQRComponent content="Hello!" />, document.body);

const SyncQRComponent = makeSyncComponent(framework, generate, toSvgDataURL);
render(<SyncQRComponent content="Hello!" />, document.body);

makeAsyncComponent(framework, generate, { minVersion: 2 });
makeSyncComponent(framework, generate, toSvgDataURL, { minVersion: 2 });

makeAsyncComponent(framework, generateNano);
makeSyncComponent(framework, generateNano, toSvgDataURL);

render(
  <AsyncQRComponent
    content="Hello!"
    minVersion={1}
    maxVersion={40}
    minCorrectionLevel={correction.L}
    maxCorrectionLevel={correction.H}
    mask={0}
    trailer={0x1234}
    pad={4}
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
    trailer={0x1234}
    pad={4}
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
makeAsyncComponent(framework, 'hello');

// @ts-expect-error
makeAsyncComponent(framework, generate, { foo: 2 });

// @ts-expect-error
render(<AsyncQRComponent />, document.body);

render(
  // @ts-expect-error
  <AsyncQRComponent content="Hello" minCorrectionLevel={-1} />,
  document.body,
);
