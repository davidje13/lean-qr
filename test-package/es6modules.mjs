import { generate } from 'lean-qr';
import { toSvgSource, toSvgDataURL } from 'lean-qr/extras/svg';
import { toPngBuffer } from 'lean-qr/extras/node_export';
import { makeAsyncComponent, makeSyncComponent } from 'lean-qr/extras/react';
import { h } from 'preact';
import * as hooks from 'preact/hooks';

if (typeof generate !== 'function') {
  throw new Error("import 'lean-qr' did not return generate function");
}

if (typeof toSvgSource !== 'function') {
  throw new Error(
    "import 'lean-qr/extras/svg' did not return toSvgSource function",
  );
}

if (typeof toPngBuffer !== 'function') {
  throw new Error(
    "import 'lean-qr/extras/node_export' did not return toPngBuffer function",
  );
}

makeAsyncComponent({ createElement: h, ...hooks }, generate);
makeSyncComponent({ createElement: h, ...hooks }, generate, toSvgDataURL);

const expected = `-----------------------------
-----------------------------
-----------------------------
-----------------------------
----ooooooo---ooo-ooooooo----
----o-----o-o-o-o-o-----o----
----o-ooo-o--o--o-o-ooo-o----
----o-ooo-o-o-o-o-o-ooo-o----
----o-ooo-o-ooo---o-ooo-o----
----o-----o---ooo-o-----o----
----ooooooo-o-o-o-ooooooo----
------------ooooo------------
-----o-oooo-oo---oo-oo-o-----
----o---oo-o-o-oo-o-o-oo-----
------o-ooo--oo--oo----o-----
----o----o-oo--ooo-o-o-oo----
----o-oo--o-o-oo-oooo--o-----
------------o---o-o---o------
----ooooooo----o--o--o-oo----
----o-----o-o-oo-ooo-o-o-----
----o-ooo-o-oo-o-o-oo-ooo----
----o-ooo-o-oooooo-oooo------
----o-ooo-o--ooooo-oo--oo----
----o-----o-ooo-oooooo-o-----
----ooooooo--o--ooo-o--o-----
-----------------------------
-----------------------------
-----------------------------
-----------------------------
`;

const sample = generate('LEAN-QR LIBRARY').toString({ on: 'o', off: '-' });
if (sample !== expected) {
  throw new Error("import 'lean-qr' produced incorrect output\n" + sample);
}
