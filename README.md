# Lean QR

Minimal library for generating QR Codes in the browser and server-side.

Optimised for code size while maintaining decent performance.
Less than 10kB uncompressed (~4kB compressed).

You can see it in action at <https://qr.davidje13.com/>

## Install dependency

```bash
npm install --save-dev lean-qr
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

There is also a small commandline tool included for testing:

```shell
lean-qr 'MY MESSAGE HERE'
```

For full documentation, run `lean-qr --help`.

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
  on: 0xFF000000,
  off: 0x00000000,
  padX: 4,
  padY: 4,
});
```

This will replace the image in `myTargetCanvas` with a copy of the current
code. The result is always at a scale of 1 pixel per module (the canvas
will be resized to the correct size automatically). To display this image
at a reasonable size, it is recommended that you use the following CSS:

```css
.myTargetCanvas {
  width: 100%;
  image-rendering: crisp-edges; /* for firefox */
  image-rendering: pixelated;
}
```

The values of `on` and `off` should be in `0xAABBGGRR` format.

### `toImageData(context[, options])`

If you do not want to replace the entire content of a canvas, you can can
use `toImageData` instead. This returns an `ImageData` representation of
the code (created using `context.createImageData`). It does not include
padding.

```javascript
const imageData = code.toImageData(myContext, {
  on: 0xFF000000,
  off: 0x00000000,
});

// later
myContext.putImageData(imageData, 200, 100);
```

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

## Resources

- <https://www.thonky.com/qr-code-tutorial/>
- <https://en.wikipedia.org/wiki/QR_code>
