# Lean QR

Minimal library for generating QR Codes in the browser and server-side.

Optimised for code size while maintaining decent performance.
Less than 10kB uncompressed (~4kB compressed).

You can see it in action at <https://qr.davidje13.com/>

Or try it from the commandline: `npx lean-qr 'MY MESSAGE HERE'`

## Install dependency

```bash
npm install --save lean-qr
```

## Usage

### NodeJS

```javascript
import { generate } from 'lean-qr';

const code = generate('LEAN-QR LIBRARY');

process.stdout.write(code.toString({
  on: '\u001B[7m  \u001B[0m', // ANSI escape: inverted
}));
```

<img src="docs/example.png" alt="Example output QR Code" width="300" />

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

### Shell

There is also a small commandline tool included for testing:

```shell
npx lean-qr 'MY MESSAGE HERE'
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
| `mode.iso8859_1`    |       8 / 1 | ISO-8859-1        |
| `mode.utf8`         |      varies | Unicode           |

Note that if you specify a mode explicitly, it is your responsibility to
ensure the content you are encoding conforms to the accepted character
set. If you provide mismatched content, the resulting QR Code will likely
be malformed.

### `multi`

`mode.multi` enables switching modes during a message, for example:

```javascript
const code = generate(mode.multi(
  mode.iso8859_1('https://example.com/'),
  mode.numeric('123456789012345678901234567890'),
  mode.alphaNumeric('/LOOKUP'),
));
```

Note that you should not mix `utf8`, `iso8859_1`, or `eci`, as they all
involve changing the global interpretation of the message and will
conflict with each other.

### `eci` / `bytes`

`mode.eci` lets you switch the Extended Channel Interpretation of the
message. After setting this, subsequent `mode.bytes` will be interpreted
in the specified character set.
[Wikipedia includes a list of possible values](https://en.wikipedia.org/wiki/Extended_Channel_Interpretation).

Note that `iso8859_1` and `utf8` both use `bytes` for their data, so
you cannot combine a custom `eci` with `iso8859_1` or `utf8`.

```javascript
const code = generate(mode.multi(
  mode.eci(24), // Arabic (Windows-1256)
  mode.bytes([0xD3]), // Shin character
));
```

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
// a RegExp which matches all characters that your mode can encode
myMode.reg = /[0-9a-zA-Z]/;

// a function which estimates the number of bits required for an input
// (fractional results will be rounded up)
myMode.est = (value, version) => (12 + value.length * 8);
```

For example the implementation of `iso8859_1`:

```javascript
const iso8859_1 = (value) => (data, version) => {
  data.push(0b0100, 4);
  data.push(value.length, version < 10 ? 8 : 16);
  for (let i = 0; i < value.length; ++i) {
    data.push(value.codePointAt(i), 8);
  }
};
iso8859_1.reg = /[\u0000-\u00FF]/;
iso8859_1.est = (value, version) => (
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

/*                                                          *
 *                                                          *
 *                                                          *
 *                                                          *
 *        ██████████████      ██████  ██████████████        *
 *        ██          ██  ██  ██  ██  ██          ██        *
 *        ██  ██████  ██    ██    ██  ██  ██████  ██        *
 *        ██  ██████  ██  ██  ██  ██  ██  ██████  ██        *
 *        ██  ██████  ██  ██████      ██  ██████  ██        *
 *        ██          ██      ██████  ██          ██        *
 *        ██████████████  ██  ██  ██  ██████████████        *
 *                        ██████████                        *
 *          ██  ████████  ████      ████  ████  ██          *
 *        ██      ████  ██  ██  ████  ██  ██  ████          *
 *            ██  ██████    ████    ████        ██          *
 *        ██        ██  ████    ██████  ██  ██  ████        *
 *        ██  ████    ██  ██  ████  ████████    ██          *
 *                        ██      ██  ██      ██            *
 *        ██████████████        ██    ██    ██  ████        *
 *        ██          ██  ██  ████  ██████  ██  ██          *
 *        ██  ██████  ██  ████  ██  ██  ████  ██████        *
 *        ██  ██████  ██  ████████████  ████████            *
 *        ██  ██████  ██    ██████████  ████    ████        *
 *        ██          ██  ██████  ████████████  ██          *
 *        ██████████████    ██    ██████  ██    ██          *
 *                                                          *
 *                                                          *
 *                                                          *
 *                                                          */
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
for (let y = 0; y < code.size; ++y) {
  for (let x = 0; x < code.size; ++x) {
    process.stdout.write(code.get(x, y) ? '##' : '  ');
  }
  process.stdout.write('\n');
}
```

Requests outside the range `0 <= x < size, 0 <= y < size` will return `false`.

## Resources

- <https://www.thonky.com/qr-code-tutorial/>
- <https://en.wikipedia.org/wiki/QR_code>
