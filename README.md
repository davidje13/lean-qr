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
import { modes, corrections, generate } from 'lean-qr';

const code = generate(modes.alphaNumeric('HELLO WORLD'), {
  minCorrectionLevel: corrections.Q,
});

for (let y = 0; y < code.height; ++y) {
  for (let x = 0; x < code.width; ++x) {
    process.stdout.write(code.get(x, y) ? '##' : '  ');
  }
  process.stdout.write('\n');
}
```

## Modes

| mode                 | bits / char | charset             |
|----------------------|-------------|---------------------|
| `modes.numeric`      | 10 / 3      | `[0-9]`             |
| `modes.alphaNumeric` | 11 / 2      | `[0-9A-Z $%*+-./:]` |
| `modes.iso8859_1`    | 8           | ISO-8859-1          |

`modes.multi` enables switching modes during a message, for example:

```javascript
const code = generate(modes.multi(
  modes.iso8859_1('https://example.com/'),
  modes.numeric('123456789012345678901234567890'),
  modes.alphaNumeric('/LOOKUP'),
));
```

## Correction Levels

| correction level | error tolerance | data overhead |
|------------------|----------------:|--------------:|
| `corrections.L`  |           ~7.5% |          ~25% |
| `corrections.M`  |          ~15.0% |          ~60% |
| `corrections.Q`  |          ~22.5% |         ~120% |
| `corrections.H`  |          ~30.0% |         ~190% |

## Resources

- <https://www.thonky.com/qr-code-tutorial/>
- <https://en.wikipedia.org/wiki/QR_code>
