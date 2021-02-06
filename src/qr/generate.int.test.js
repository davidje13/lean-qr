import generate from './generate.mjs';
import mode from './options/modes.mjs';
import { names as correction } from './options/corrections.mjs';
import { loadImage } from '../test-helpers/images.mjs';

// Source https://www.thonky.com/qr-code-tutorial/format-version-information
const KNOWN = loadImage('helloworld.png');
const KNOWN_DATA = mode.alphaNumeric('HELLO WORLD');
const KNOWN_PARAMS = {
  minCorrectionLevel: correction.Q,
  maxCorrectionLevel: correction.Q,
  minVersion: 1,
  maxVersion: 1,
  mask: 6,
};

const LONG_MESSAGE = 'this is a much longer message which needs at least version 4';

describe('generate', () => {
  it('renders a QR code given exact parameters', () => {
    const code = generate(KNOWN_DATA, KNOWN_PARAMS);
    expect(code).toMatchImage(KNOWN);
  });

  it('uses a specific mask if given', () => {
    const code = generate(KNOWN_DATA, {
      ...KNOWN_PARAMS,
      mask: 2,
    });
    expect(code).not.toMatchImage(KNOWN);
  });

  it('automatically picks the optimal mask by default', () => {
    const code = generate(KNOWN_DATA, {
      ...KNOWN_PARAMS,
      mask: null,
    });
    expect(code).toMatchImage(KNOWN);
  });

  it('uses a specific correction level if given', () => {
    const code = generate(KNOWN_DATA, {
      ...KNOWN_PARAMS,
      minCorrectionLevel: correction.L,
      maxCorrectionLevel: correction.L,
    });
    expect(code).not.toMatchImage(KNOWN);
  });

  it('automatically picks the highest correction level by default', () => {
    const code = generate(KNOWN_DATA, {
      ...KNOWN_PARAMS,
      minCorrectionLevel: correction.min,
      maxCorrectionLevel: correction.max,
    });
    expect(code).toMatchImage(KNOWN);
  });

  it('uses a specific version if given', () => {
    const code = generate(KNOWN_DATA, {
      ...KNOWN_PARAMS,
      minVersion: 2,
      maxVersion: 2,
    });
    expect(code).not.toMatchImage(KNOWN);
  });

  it('automatically picks the smallest version by default', () => {
    const code = generate(KNOWN_DATA, {
      ...KNOWN_PARAMS,
      minVersion: 1,
      maxVersion: 40,
    });
    expect(code).toMatchImage(KNOWN);
  });

  it('throws if too much data is provided for the max version', () => {
    expect(() => generate(mode.iso8859_1(LONG_MESSAGE), {
      maxVersion: 2,
    })).toThrow('Too much data');
  });

  it('picks a version depending on the message length', () => {
    const code = generate(mode.iso8859_1(LONG_MESSAGE));
    expect(code.size).toEqual(4 * 4 + 17);
  });

  it('allows larger versions to be forced', () => {
    const code = generate(mode.iso8859_1(LONG_MESSAGE), { minVersion: 10 });
    expect(code.size).toEqual(10 * 4 + 17);
  });
});

describe('known examples', () => {
  it('wikipedia link', () => {
    // Source: https://en.wikipedia.org/wiki/File:QR_code_for_mobile_English_Wikipedia.svg
    const code = generate(mode.iso8859_1('http://en.m.wikipedia.org'), {
      minCorrectionLevel: correction.Q,
      maxCorrectionLevel: correction.Q,
      mask: 1,
    });
    expect(code).toMatchImage(loadImage('wikipedia.png'));
  });

  it('Ver1', () => {
    // Source: https://en.wikipedia.org/wiki/File:Qr-1.svg
    const code = generate(mode.iso8859_1('Ver1'));
    expect(code).toMatchImage(loadImage('v1.png'));
  });

  it('Version 2', () => {
    // Source: https://en.wikipedia.org/wiki/File:Qr-2.svg
    const code = generate(mode.iso8859_1('Version 2'), {
      minCorrectionLevel: correction.H,
    });
    expect(code).toMatchImage(loadImage('v2.png'));
  });

  it('Version 3', () => {
    // Source: https://en.wikipedia.org/wiki/File:Qr-3.svg
    const code = generate(mode.iso8859_1('Version 3 QR Code'), {
      minCorrectionLevel: correction.H,
    });
    expect(code).toMatchImage(loadImage('v3.png'));
  });

  it('Version 4', () => {
    // Source: https://en.wikipedia.org/wiki/File:Qr-4.svg
    const code = generate(mode.iso8859_1('Version 4 QR Code, up to 50 char'), {
      minCorrectionLevel: correction.H,
    });
    expect(code).toMatchImage(loadImage('v4.png'));
  });

  it('Version 10', () => {
    // Source: https://en.wikipedia.org/wiki/File:Qr-code-ver-10.svg
    const code = generate(mode.multi(
      mode.alphaNumeric('VERSION 10 QR CODE'),
      mode.iso8859_1(','),
      mode.alphaNumeric(' UP TO 174 CHAR AT H LEVEL'),
      mode.iso8859_1(','),
      mode.alphaNumeric((
        ' WITH 57X57 MODULES AND PLENTY OF ERROR CORRECTION TO GO AROUND.' +
        '  NOTE THAT THERE ARE ADDITIONAL TRACKING BOXES'
      )),
    ), { minCorrectionLevel: correction.H });
    expect(code).toMatchImage(loadImage('v10.png'));
  });

  it('Version 10 with automatic encoding', () => {
    // Source: https://en.wikipedia.org/wiki/File:Qr-code-ver-10.svg
    const code = generate((
      'VERSION 10 QR CODE, UP TO 174 CHAR AT H LEVEL, WITH 57X57 MODULES AND PLENTY OF' +
      ' ERROR CORRECTION TO GO AROUND.  NOTE THAT THERE ARE ADDITIONAL TRACKING BOXES'
    ), { minCorrectionLevel: correction.H });
    expect(code).toMatchImage(loadImage('v10.png'));
  });

  const COMMON_BLURB = (
    'A QR code (abbreviated from Quick Response code) is a type of matrix barcode (or ' +
    'two-dimensional code) that is designed to be read by smartphones. The code consists of ' +
    'black modules arranged in a square pattern on a white background. The information encoded ' +
    'may be text, a URL, or other data.\nCreated by Toyota subsidiary Denso Wave in 1994, the ' +
    'QR code is one of the most popular types of two-dimensional barcodes. The QR code was ' +
    'designed to allow its contents to be decoded at high speed.\nThe technology has seen ' +
    'frequent use in Japan and South Korea; the United Kingdom is the seventh-largest national ' +
    'consumer of QR codes.\nAlthough initially used for tracking parts in vehicle ' +
    'manufacturing, QR codes now are used in a much broader context, including both commercial ' +
    'tracking applications and convenience-oriented applications aimed at mobile phone users ' +
    '(termed mobile tagging). QR codes may be used to display text to the user, to add a vCard ' +
    'contact to the user\'s device, to open a Uniform Resource Identifier (URI), or to compose ' +
    'an e-mail or text message. Users can generate and print their own QR codes for others to ' +
    'scan and use by visiting one of several paid and free QR code generating sites or apps.'
  );

  it('Version 25', () => {
    // Source: https://en.wikipedia.org/wiki/File:QR_Code_Version_25.svg
    const code = generate(mode.iso8859_1((
      `Version 25 QR Code, up to 1853 characters at L level.\n${COMMON_BLURB}`
    )));
    expect(code).toMatchImage(loadImage('v25.png'));
  });

  it('Version 40', () => {
    // Source: https://en.wikipedia.org/wiki/File:Qr-code-ver-40.svg
    const code = generate(mode.iso8859_1((
      `Version 40 QR Code can contain up to 1852 chars.\n${COMMON_BLURB}\n`
    )), { minCorrectionLevel: correction.H, mask: 2 });
    expect(code).toMatchImage(loadImage('v40.png'));
  });
});
