# <img src="https://qr.davidje13.com/resources/logo.png" alt="Lean QR" />

Lean QR is a lightweight yet fully-featured library for generating QR Codes.
It runs in NodeJS and all recent browsers, and includes wrapper components
for React and Preact. Under 4kB compressed.

## Features

- ISO 18004 compliant;
- Lightweight (less than 4kB compressed, ~7kB uncompressed);
- Simple yet flexible API, with sensible defaults for all configuration;
- Supports all standard encodings out-of-the box (including Unicode and Shift-JIS);
- Automatic encoding to minimise output size;
- Fast enough for lag-free live editing;
- Multiple output formats (canvas / PNG / SVG / text).

You can [see it in action online](https://qr.davidje13.com/), or try it from the terminal:

```shell
npx lean-qr 'MY MESSAGE HERE'
```

## Basic Usage

```html
<canvas id="my-qr-code" />
<a href="#" download="qr.png" id="download-link">Download</a>

<style>
#my-qr-code {
  image-rendering: pixelated;
  width: 100%;
}
</style>
```

```javascript
import { generate } from 'lean-qr';

const qrCode = generate('LEAN-QR LIBRARY');

// display in canvas:
qrCode.toCanvas(document.getElementById('my-qr-code'));

// provide a download link:
const dataUrl = qrCode.toDataURL({ scale: 10 });
document.getElementById('download-link')
  .setAttribute('href', dataUrl);

// display as text:
console.log(qrCode.toString());
```

## Full Documentation

- [Quickstart](https://qr.davidje13.com/docs/#quickstart)
- [API Reference](https://qr.davidje13.com/docs/#api)
- [Migrating from Version 1.x to 2.x](https://qr.davidje13.com/docs/#v2)
- [Source Code](https://github.com/davidje13/lean-qr)
