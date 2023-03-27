import { generate } from 'lean-qr';
import { makeComponent } from 'lean-qr/extras/react';
import { createElement, render } from 'preact';
import * as hooks from 'preact/hooks';

// this file just checks types; the code is not executed

const QRComponent = makeComponent({ createElement, ...hooks }, generate);
render(<QRComponent content="Hello!" />, document.body);

// @ts-expect-error
makeComponent(hooks, generate);

// @ts-expect-error
makeComponent({ createElement }, generate);

// @ts-expect-error
makeComponent({ createElement, ...hooks }, 'hello');

// @ts-expect-error
preact.render(<QRComponent />, document.body);
