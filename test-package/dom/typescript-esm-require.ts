import LeanQR = require('lean-qr');
import Svg = require('lean-qr/extras/svg');
import NodeExport = require('lean-qr/extras/node_export');
import Errors = require('lean-qr/extras/errors');

const code = LeanQR.generate('foo');
process.stdout.write(code.toString({ on: 'y', off: 'n' }));
process.stdout.write(Svg.toSvgSource(code));
process.stdout.write(NodeExport.toPngBuffer(code).BYTES_PER_ELEMENT.toString());
process.stderr.write(Errors.readError(new Error()));

// @ts-expect-error
LeanQR.generate(0);

// @ts-expect-error
code.toString({ nope: 'nope' });

// @ts-expect-error
Svg.toSvgSource('123');

// @ts-expect-error
NodeExport.toPngBuffer('123');

// @ts-expect-error
Errors.readError();
