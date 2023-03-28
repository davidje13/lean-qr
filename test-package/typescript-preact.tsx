import { correction, generate } from 'lean-qr';
import {
  makeDynamicComponent,
  makeStaticComponent,
} from 'lean-qr/extras/react';
import { toSvgDataURL } from 'lean-qr/extras/svg';
import { createElement, render } from 'preact';
import * as hooks from 'preact/hooks';

// this file just checks types; the code is not executed

const DynamicQRComponent = makeDynamicComponent(
  { createElement, ...hooks },
  generate,
);

const StaticQRComponent = makeStaticComponent(
  { createElement, ...hooks },
  generate,
  toSvgDataURL,
);

render(<DynamicQRComponent content="Hello!" />, document.body);

render(<StaticQRComponent content="Hello!" />, document.body);

render(
  <DynamicQRComponent
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
  <StaticQRComponent
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
makeDynamicComponent(hooks, generate);

// @ts-expect-error
makeDynamicComponent({ createElement }, generate);

// @ts-expect-error
makeDynamicComponent({ createElement, ...hooks }, 'hello');

// @ts-expect-error
render(<DynamicQRComponent />, document.body);

render(
  // @ts-expect-error
  <DynamicQRComponent content="Hello" minCorrectionLevel={-1} />,
  document.body,
);
