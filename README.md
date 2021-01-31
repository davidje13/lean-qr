# Lean QR

Minimal library for generating QR codes in the browser and server-side.

Optimised for code size while maintaining decent performance.
Less than 10kB uncompressed.

## Install dependency

```bash
npm install --save-dev lean-qr
```

## Usage

```javascript
import { modes, generate } from 'lean-qr';

const code = generate(modes.alphaNumeric('LEAN-QR LIBRARY'));

process.stdout.write(code.toString({
  on: '\u001B[7m  \u001B[0m', // ANSI escape: inverted
}));
```

<img src="docs/example.png" width="300" />

There is also a small commandline tool included for testing:

```shell
lean-qr 'MY MESSAGE HERE'
```

For full documentation, run `lean-qr --help`.

## Modes

| mode                 | bits / char | charset           |
|----------------------|------------:|-------------------|
| `modes.numeric`      |      10 / 3 | `0-9`             |
| `modes.alphaNumeric` |      11 / 2 | `0-9A-Z $%*+-./:` |
| `modes.iso8859_1`    |       8 / 1 | ISO-8859-1        |

`modes.multi` enables switching modes during a message, for example:

```javascript
const code = generate(modes.multi(
  modes.iso8859_1('https://example.com/'),
  modes.numeric('123456789012345678901234567890'),
  modes.alphaNumeric('/LOOKUP'),
));
```

Other modes are not currently supported, but it is possible to write
custom modes:

```javascript
const myMode = (value) => (data, version) => {
  // call functions on data to encode the value
  data.push(0b101010, 6); // value, bits (supports up to 24-bits)
  data.padByte(); // pad with 0s until the next byte boundary
};

const code = generate(myMode('foobar'));
```

For example the implementation of `iso8859_1`:

```javascript
const iso8859_1 = (value) => {
  const bytes = new TextEncoder('iso-8859-1').encode(value);
  return (data, version) => {
    data.push(0b0100, 4);
    data.push(bytes.length, version < 10 ? 8 : 16);
    for (let i = 0; i < bytes.length; ++i) {
      data.push(bytes[i], 8);
    }
  };
};
```

## Correction Levels

You can specify minimum and maximum correction levels:

```javascript
const code = generate(modes.alphaNumeric('LEAN-QR LIBRARY'), {
  minCorrectionLevel: corrections.M,
  maxCorrectionLevel: corrections.Q,
});
```

`generate` will pick the smallest code size which supports the
`minCorrectionLevel`, then within this version will use the highest
possible correction level up to `maxCorrectionLevel`.

| correction level | error tolerance | data overhead |
|------------------|----------------:|--------------:|
| `corrections.L`  |           ~7.5% |          ~25% |
| `corrections.M`  |          ~15.0% |          ~60% |
| `corrections.Q`  |          ~22.5% |         ~120% |
| `corrections.H`  |          ~30.0% |         ~190% |

## Versions

By default, all versions (sizes) can be used. To restrict this, you can
specify a minimum and/or maximum version:

```javascript
const code = generate(modes.alphaNumeric('LEAN-QR LIBRARY'), {
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
is designed to maximize readability by QR code readers. This is done by
default, however if you would like to specify a particular mask, you can:

```javascript
const code = generate(modes.alphaNumeric('LEAN-QR LIBRARY'), {
  mask: 5,
});
```

Valid masks are integers in the range 0 &ndash; 7 (inclusive).

## Output

The output can be displayed in several ways.

### `toString`

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

### `get`

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
