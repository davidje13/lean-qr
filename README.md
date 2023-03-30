# Lean QR

Minimal library for generating QR Codes in the browser and server-side.
Includes a convenience wrapper for React / Preact.

Optimised for code size while maintaining decent performance and supporting
all QR features. Less than 8kB uncompressed (less than 4kB compressed).

You can see it in action at <https://qr.davidje13.com/>

Or try it from the commandline: `npx lean-qr 'MY MESSAGE HERE'`

## Install dependency

```bash
npm install --save lean-qr
```

Updating from version 1.x?
See the [notable changes](#notable-changes-in-version-2).

## Usage

### Browser

```javascript
import { generate } from 'lean-qr';

const code = generate('LEAN-QR LIBRARY');

code.toCanvas(document.getElementById('my-canvas'));
```

```html
<canvas id="my-canvas" />

<style>
#my-canvas {
  width: 100%;
  image-rendering: crisp-edges; /* for firefox */
  image-rendering: pixelated;
}
</style>
```

### React / Preact

A wrapper is available which is compatible with React and Preact (and
any other library which offers `createElement` and React-style hooks)

#### React

```javascript
import { generate } from 'lean-qr';
import { makeDynamicComponent } from 'lean-qr/extras/react';
import * as React from 'react';

const QR = makeDynamicComponent(React, generate);

const MyComponent = () => (
  <section>
    Scan this QR Code!
    <QR content="LEAN-QR LIBRARY" className="qr-code" />
  </section>
);
```

```css
.qr-code {
  width: 300px;
}
```

See below for an alternative if you need
[server-side rendering](#server-side-rendering).

#### Preact

```javascript
import { generate } from 'lean-qr';
import { makeDynamicComponent } from 'lean-qr/extras/react';
import { createElement } from 'preact';
import * as hooks from 'preact/hooks';

const QR = makeDynamicComponent({ createElement, ...hooks }, generate);
```

If you want to reduce the build size further, you can provide just
the `useRef` and `useEffect` hooks rather than all hooks to enable
tree shaking optimisations during the build. Note that the set of
required hooks may change in future versions.

### NodeJS

```javascript
import { generate } from 'lean-qr';

const code = generate('LEAN-QR LIBRARY');

process.stdout.write(code.toString({
  on: '\u001B[7m  \u001B[0m', // ANSI escape: inverted
}));
```

<img src="docs/example.png" alt="Example output QR Code" width="300" />

### Shell

There is also a small commandline tool included for testing:

```shell
npx lean-qr 'MY MESSAGE HERE'

npx lean-qr '漢字'

npx lean-qr --format svg 'hello'
```

For full documentation, run `npx lean-qr --help`.

## Modes

By default, the optimal encoding mode is chosen to minimise the resulting
image size (this includes switching modes part way through a message if
it reduces the size). If you want to specify an explicit mode, you can:

```javascript
import { mode, generate } from 'lean-qr';
const code = generate(mode.alphaNumeric('LEAN-QR LIBRARY'));
```

| mode                | bits / char | charset           |
|---------------------|------------:|-------------------|
| `mode.numeric`      |      10 / 3 | `0-9`             |
| `mode.alphaNumeric` |      11 / 2 | `0-9A-Z $%*+-./:` |
| `mode.ascii`        |       8 / 1 | 7-bit ASCII       |
| `mode.iso8859_1`    |       8 / 1 | ISO-8859-1        |
| `mode.shift_jis`    |      13 / 1 | See notes below   |
| `mode.utf8`         |      varies | Unicode           |

Note that if you specify a mode explicitly, it is your responsibility to
ensure the content you are encoding conforms to the accepted character
set. If you provide mismatched content, the resulting QR Code will likely
be malformed.

`shift_jis` supports all double-byte Shift-JIS characters in the ranges:
[0x8140 &ndash; 0x9FFC], [0xE040 &ndash; 0xEBBF].

### `multi`

`mode.multi` enables switching modes during a message, for example:

```javascript
const code = generate(mode.multi(
  mode.iso8859_1('https://example.com/'),
  mode.numeric('123456789012345678901234567890'),
  mode.alphaNumeric('/LOOKUP'),
));
```

### `eci` / `bytes`

`mode.eci` lets you switch the Extended Channel Interpretation of the
message. After setting this, subsequent `mode.bytes` will be interpreted
in the specified character set.
[Wikipedia includes a list of possible values](https://en.wikipedia.org/wiki/Extended_Channel_Interpretation).

```javascript
const code = generate(mode.multi(
  mode.eci(24), // Arabic (Windows-1256)
  mode.bytes([0xD3]), // Shin character
));
```

`mode.eci` will avoid outputting additional switches if the ECI
already matches the requested value.

Note that `mode.iso8859_1` sets ECI 3 for its content, and `mode.utf8`
sets ECI 26. `mode.ascii` does not set an explicit ECI mode, as readers
are supposed to default to ECI 3, and even though some default to ECI 26
instead, these share the same codepoints for all ASCII values.

If you set an ECI which is not compatible with ASCII, do not follow it
with a `mode.ascii` section (prefer `mode.iso8859_1` or `mode.utf8`, as
these will explicitly set the ECI for their content).

### `auto`

`mode.auto` will pick the optimal combination of modes for the message.
This is used by default if you provide a plain string to `generate`, but
you can also use it explicitly to get more control:

```javascript
const code = generate(mode.auto('FOOBAR', {
  modes: [mode.numeric, mode.iso8859_1], // exclude alphaNumeric mode
}));
```

You can omit the `modes` argument to default to the standard modes.
You can also provide your own custom modes, and `auto` will consider
them alongside the built-in modes (see below for details).

As a convenience, you can also pass `auto` configuration directly to
`generate`:

```javascript
const code = generate('FOOBAR', {
  modes: [mode.numeric, mode.iso8859_1],
});
```

### Custom modes

Other modes are not currently supported, but it is possible to write
custom modes:

```javascript
const myMode = (value) => (data, version) => {
  // call functions on data to encode the value
  data.push(0b101010, 6); // value, bits (supports up to 24-bits)
};

const code = generate(myMode('foobar'));
```

If you want your custom mode to be compatible with `auto`, you need to
provide a pair of properties:

```javascript
// a function taking a character and returning true if it is suppoerted
myMode.test = RegExp.prototype.test.bind(/[0-9a-zA-Z]/);
// or
myMode.test = (c) => /[0-9a-zA-Z]/.test(c);

// a function which estimates the number of bits required for an input
// (fractional results will be rounded up)
myMode.est = (value, version) => (12 + value.length * 8);
```

You can then register it using `.with` to be automatically considered
alongside other possible modes:

```javascript
const myGenerate = generate.with(myCustomMode);
const code = myGenerate('text');
```

Or for more control you can specify all modes explicitly:

```javascript
const code = generate('text', {
  modes: [
    myCustomMode,
    mode.numeric,
    mode.alphaNumeric,
    mode.ascii,
    mode.iso8859_1,
    mode.shift_jis,
    mode.utf8,
  ],
});
```

#### Example

The implementation of `ascii`:

```javascript
const ascii = (value) => (data, version) => {
  data.push(0b0100, 4);
  data.push(value.length, version < 10 ? 8 : 16);
  [...value].forEach((c) => data.push(c.codePointAt(0), 8));
};
ascii.test = RegExp.prototype.test.bind(/[\u0000-\u007F]/);
ascii.est = (value, version) => (
  4 + (version < 10 ? 8 : 16) +
  value.length * 8
);
```

## Correction Levels

You can specify minimum and maximum correction levels:

```javascript
const code = generate(mode.alphaNumeric('LEAN-QR LIBRARY'), {
  minCorrectionLevel: correction.M,
  maxCorrectionLevel: correction.Q,
});
```

`generate` will pick the smallest code size which supports the
`minCorrectionLevel`, then within this version will use the highest
possible correction level up to `maxCorrectionLevel`.

| correction level | error tolerance | data overhead |
|------------------|----------------:|--------------:|
| `correction.L`   |           ~7.5% |          ~25% |
| `correction.M`   |          ~15.0% |          ~60% |
| `correction.Q`   |          ~22.5% |         ~120% |
| `correction.H`   |          ~30.0% |         ~190% |

## Versions

By default, all versions (sizes) can be used. To restrict this, you can
specify a minimum and/or maximum version:

```javascript
const code = generate(mode.alphaNumeric('LEAN-QR LIBRARY'), {
  minVersion: 10,
  maxVersion: 20,
});
```

Versions must be integers in the range 1 &ndash; 40 (inclusive).
The resulting size will be `17 + version * 4`.

If there is too much data for the `maxVersion` size, an exception will be
thrown.

## Masks

ISO 18004 requires masks be chosen according to a specific algorithm which
is designed to maximize readability by QR Code readers. This is done by
default, however if you would like to specify a particular mask, you can:

```javascript
const code = generate(mode.alphaNumeric('LEAN-QR LIBRARY'), {
  mask: 5,
});
```

Valid masks are integers in the range 0 &ndash; 7 (inclusive).

## Output

The output can be displayed in several ways.

### `toString([options])`

`toString` takes several options. The defaults are shown here:

```javascript
code.toString({
  on: '##',
  off: '  ',
  lf: '\n',
  padX: 4,
  padY: 4,
});
```

Note that 4-cell padding is required by the standard to guarantee a
successful read, but you can change it to any value if you want.

Ensure the `on` and `off` strings have the same length or the resulting
code will be misaligned.

Note that if your terminal's line height is greater than the character
height (usually the case in terminal emulators running inside a graphical
interface), you should use ANSI escape sequences as shown in the top
example to ensure the code will be readable. But it is also possible to
display the result in other ways:

```javascript
process.stdout.write(code.toString({
  on: '\u001B[40m  ',   // ANSI escape: black background
  off: '\u001B[107m  ', // ANSI escape: white background
  lf: '\u001B[0m\n',    // ANSI escape: default
}));

// Or using unicode box drawing characters:
process.stdout.write(code.toString({
  on: '\u2588\u2588',
  off: '  ',
}));
```

### `toCanvas(canvas[, options])`

`toCanvas` takes several options. The defaults are shown here:

```javascript
code.toCanvas(myTargetCanvas, {
  on: [0x00, 0x00, 0x00, 0xFF],
  off: [0x00, 0x00, 0x00, 0x00],
  padX: 4,
  padY: 4,
});
```

This will replace the image in `myTargetCanvas` (which must be a `canvas`
element) with a copy of the current code. The result is always at a scale
of 1 pixel per module (the canvas will be resized to the correct size
automatically). To display this image at a reasonable size, it is
recommended that you use the following CSS:

```css
.myTargetCanvas {
  width: 100%;
  image-rendering: crisp-edges; /* for firefox */
  image-rendering: pixelated;
}
```

The values of `on` and `off` should be arrays in `[red, green, blue, alpha]`
format. If `alpha` is omitted, 255 is assumed.

### `toImageData(context[, options])`

If you do not want to replace the entire content of a canvas, you can can
use `toImageData` instead. This returns an `ImageData` representation of
the code (created using `context.createImageData`).

```javascript
const imageData = code.toImageData(myContext, {
  on: [0x00, 0x00, 0x00, 0xFF],
  off: [0x00, 0x00, 0x00, 0x00],
  padX: 4,
  padY: 4,
});

// later
myContext.putImageData(imageData, 200, 100);
```

`myContext` must be a 2D context (i.e. the result of calling
`myCanvas.getContext('2d')`) on a canvas element.

Note that until version 1.4.0, `toImageData` did not include padding. To get
the same behaviour in 1.4.0+, set `padX` and `padY` to 0.

### `toDataURL([options])`

Returns a string which can be used as a `href`, e.g. for downloading;

```javascript
const url = code.toDataURL({
  type: 'image/png',
  on: [0x00, 0x00, 0x00, 0xFF],
  off: [0x00, 0x00, 0x00, 0x00],
  padX: 4,
  padY: 4,
  scale: 1,
});

// use with elements such as:
// <a href="<url>" download="my-qr.png">Download</a>
```

This URL can also be used as an `img` source, but this is not recommended
(for best results use `toCanvas` as shown above &mdash; this will avoid blurry
edges on high resolution displays and if the user zooms in).

Note that this is only available in-browser; it will fail if called in NodeJS.

### `toSvg(code, target[, options])`

This is not included in the main library to keep it small, but if you need
SVG output, you can access it from a separate import (adds ~2kB):

```javascript
import { toSvg } from 'lean-qr/extras/svg';

const mySvg = document.getElementById('my-svg');
const svg = toSvg(code, mySvg, {
  on: 'black',
  off: 'transparent',
  padX: 4,
  padY: 4,
  width: null,
  height: null,
  scale: 1,
});
```

This will replace the image in `mySvg` (which must be an `svg` element)
with a copy of the current code. The result is always at a scale of 1 SVG
unit per module (the viewBox will be resized to the correct size
automatically). You can define a different size for the SVG element to scale
the image.

If `mySvg` is the `document` object, this will create and return a new SVG
entity associated with the document (but not attached to it).

If `width` / `height` is given, the root SVG element will have the explicit
size applied. If these are not specified, they will be auto-calculated by
multiplying the code size + padding by `scale`. You can override this for
display by setting CSS properties
(e.g. `mySvg.style.width = '100%'; mySvg.style.height = 'auto';`).

### `toSvgSource(code[, options])`

Like `toSvg` but returns the source code for an SVG, rather than manipulating
DOM nodes (can be called inside NodeJS).

```javascript
import { toSvgSource } from 'lean-qr/extras/svg';

const svgSource = toSvgSource(code, {
  on: 'black',
  off: 'transparent',
  padX: 4,
  padY: 4,
  width: null,
  height: null,
  xmlDeclaration: false,
  scale: 1,
});
```

Returns a complete SVG document which can be written to a standalone file or
included inside a HTML document.

If writing to a file, you should set `xmlDeclaration` to `true` (this prefixes
the source with `<?xml version="1.0" encoding="UTF-8" ?>`).

### `toSvgDataURL(code[, options])`

Like `toSvg` but returns a `data:image/svg` URL containing the image data,
suitable for displaying in an `img` tag or downloading from an `a` tag.
Can be called inside NodeJS.

```javascript
import { toSvgDataURL } from 'lean-qr/extras/svg';

const dataURL = toSvgDataURL(code, {
  on: 'black',
  off: 'transparent',
  padX: 4,
  padY: 4,
  width: null,
  height: null,
  scale: 1,
});
```

### `toSvgPath(code)`

A raw SVG path definition for the QR code. Used by `toSvg` and `toSvgSource`.

```javascript
import { toSvgPath } from 'lean-qr/extras/svg';

const svgPath = toSvgPath(code);
// e.g. "M1 2L1 1L2 1L2 2ZM3 3L3 2L4 2L4 3Z"
```

The returned path is always at a scale of 1 SVG unit to 1 module, with no
padding. The path will define the whole QR code in a single string suitable for
use inside `<path d="[path here]">`, and can be used with `fill-rule` of either
`evenodd` or `nonzero`. The path is optimised to ensure only true edges are
defined; it will not include overlapping edges (and will not have "cracks"
between pixels). No other guarantees are made about the structure of this
string, and the details could change in later versions.

### `get(x, y)`

For other types of output, you can inspect the data directly:

```javascript
for (let y = 0; y < code.size; y++) {
  for (let x = 0; x < code.size; x++) {
    process.stdout.write(code.get(x, y) ? '##' : '  ');
  }
  process.stdout.write('\n');
}
```

Requests outside the range `0 <= x < size, 0 <= y < size` will return `false`.

## React / Preact API

Call `makeDynamicComponent` from the global scope (not inside a
render method) to generate a component which can be rendered later:

```javascript
import { generate } from 'lean-qr';
import { makeDynamicComponent } from 'lean-qr/extras/react';
import * as React from 'react';

const QR = makeDynamicComponent(React, generate);
```

All the configuration options documented above can be passed to the
wrapper component, plus a `className` for the rendered `canvas`:

```javascript
<QR
  content="Hello!"
  minVersion={1}
  maxVersion={40}
  minCorrectionLevel={correction.L}
  maxCorrectionLevel={correction.H}
  mask={null}
  padX={4}
  padY={4}
  on={[0, 0, 0, 255]}
  off={[0, 0, 0, 0]}
  className=""
/>
```

All properties are optional except `content`.
The property values shown above are the defaults.

### Server-side Rendering

The `makeDynamicComponent` helper will render to a `<canvas>` from a
`useEffect` hook (this is the most performant option if the code will
change dynamically), but this cannot be server-side rendered.

If you need server-side rendering, you can use `makeStaticComponent`
instead, which will render an `<img>` tag with an SVG data source
calculated in a `useMemo` hook:

```javascript
import { generate } from 'lean-qr';
import { makeStaticComponent } from 'lean-qr/extras/react';
import { toSvgDataURL } from 'lean-qr/extras/svg';
import * as React from 'react';

const QR = makeStaticComponent(React, generate, toSvgDataURL);

const MyComponent = () => (
  <section>
    Scan this QR Code!
    <QR content="LEAN-QR LIBRARY" className="qr-code" />
  </section>
);
```

The API for this is slightly different: `on` and `off` take `string`
values for the colour, rather than arrays:

```javascript
<QR content="Hello!" on="black" off="rgba(0,0,0,0)" />
```

This version may also be preferable to avoid the code "flickering"
when it first appears, but note that it causes the QR code to be
calculated synchronously during the render, which may introduce some
lag if the code changes (especially if it changes in response to live
user input). For this reason, `makeStaticComponent` is only
recommended for relatively static codes (hence the name).

## Notable Changes in Version 2

For basic use, updating from version 1.x to 2.x should have no issues, but
if you are using more advanced customisation options or relying on specific
behaviours, you may need to update your code:

- `.reg` (regular expression) properties of modes have been replaced with
  `.test` (API compatible with `RegExp.test`). Custom modes will need
  updating;
- `iso8859_1` mode will now explicitly set the ECI to 3 for better
  compatibility with some readers. If you only need 7-bit ASCII characters,
  use `ascii` mode instead (which does not set the ECI, saving some space).
  `auto` mode will handle this automatically;
- `auto` mode is now able to mix `utf8` with other modes if it will save
  space (some QR codes may change, but the meaning will be the same);
- `shift_jis` mode is now available by default (the `extras/jis` export
  has been removed);
- custom modes can now be registered using
  `updatedGenerator = generator.with(myCustomMode)`, avoiding the need to
  specify all the default modes;
- `toSvgSource` / `toSvgDataURL` now accept `rgb()` / `rgba()` syntax for
  colours, matching `toSvg`;
- `toCanvas` / `toImageData` / `toDataURL` no longer accept 32-bit
  little-endian integer values for colours. If you were using this legacy
  behaviour, update your code to pass colours as arrays instead:
  `[red, green, blue, alpha?]` (for example, `[255, 0, 255, 255]` = purple);
- some error message texts have changed;
- internal properties and methods are now minified (documented methods are
  not affected);
- the library is smaller than ever!

## Resources

- <https://www.thonky.com/qr-code-tutorial/>
- <https://en.wikipedia.org/wiki/QR_code>
