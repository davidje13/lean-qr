import { generate } from 'lean-qr';
import {
  makeDynamicComponent,
  makeStaticComponent,
} from 'lean-qr/extras/react';
import { toSvgDataURL } from 'lean-qr/extras/svg';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

// this file just checks types; the code is not executed

const DynamicQRComponent = makeDynamicComponent(React, generate);
createRoot(document.body).render(<DynamicQRComponent content="Hello!" />);

const StaticQRComponent = makeStaticComponent(React, generate, toSvgDataURL);
createRoot(document.body).render(<StaticQRComponent content="Hello!" />);

// @ts-expect-error
makeComponent(React, 'hello');

// @ts-expect-error
preact.render(<DynamicQRComponent />, document.body);
