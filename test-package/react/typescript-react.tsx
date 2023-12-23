import { generate } from 'lean-qr';
import { makeAsyncComponent, makeSyncComponent } from 'lean-qr/extras/react';
import { toSvgDataURL } from 'lean-qr/extras/svg';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

// this file just checks types; the code is not executed

const AsyncQRComponent = makeAsyncComponent(React, generate);
createRoot(document.body).render(<AsyncQRComponent content="Hello!" />);

const SyncQRComponent = makeSyncComponent(React, generate, toSvgDataURL);
createRoot(document.body).render(<SyncQRComponent content="Hello!" />);

// @ts-expect-error
makeComponent(React, 'hello');

// @ts-expect-error
preact.render(<AsyncQRComponent />, document.body);
