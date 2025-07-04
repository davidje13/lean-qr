import {
  fail,
  ERROR_BAD_FRAMEWORK,
  ERROR_BAD_GENERATE,
  ERROR_BAD_TO_SVG_DATA_URL,
} from '../util.mjs';

const hasChange = (a, b, props) => props.some((prop) => a[prop] !== b[prop]);
const explode = (o, props) => props.map((prop) => o[prop]);

const GENERATE_OPTS = [
  'content',
  'minCorrectionLevel',
  'maxCorrectionLevel',
  'minVersion',
  'maxVersion',
  'mask',
  'trailer',
  'modes',
];

const ALL_OPTS = [
  ...GENERATE_OPTS,
  'on',
  'off',
  'padX',
  'padY',
  'width',
  'height',
  'scale',
];
const STYLES = { imageRendering: 'pixelated' };

const dataOrError = (fn) => {
  try {
    return fn();
  } catch (e) {
    console.warn(e.message);
    // implicit return undefined;
  }
};

export const makeAsyncComponent =
  (
    { createElement, useEffect, useRef } = fail(ERROR_BAD_FRAMEWORK),
    generate = fail(ERROR_BAD_GENERATE),
    defaultOptions = {},
  ) =>
  (props) => {
    const options = { ...defaultOptions, ...props };
    const canvasRef = useRef();
    const codeRef = useRef([0, {}]);
    useEffect(
      () => {
        const code = codeRef.current;
        const canvas = canvasRef.current;
        canvas.hidden = !dataOrError(() => {
          if (hasChange(options, code[1], GENERATE_OPTS)) {
            code[0] = generate(options.content, options);
          }
          code[0].toCanvas(canvas, options);
          return 1;
        });
        code[1] = options;
      },
      explode(options, ALL_OPTS),
    );

    return createElement('canvas', {
      ref: canvasRef,
      style: STYLES,
      className: options.className,
    });
  };

export const makeSyncComponent =
  (
    { createElement, useMemo } = fail(ERROR_BAD_FRAMEWORK),
    generate = fail(ERROR_BAD_GENERATE),
    toSvgDataURL = fail(ERROR_BAD_TO_SVG_DATA_URL),
    defaultOptions = {},
  ) =>
  (props) => {
    const options = { ...defaultOptions, ...props };
    const code = useMemo(
      () => dataOrError(() => generate(options.content, options)),
      explode(options, GENERATE_OPTS),
    );
    const data = useMemo(
      () => code && dataOrError(() => toSvgDataURL(code, options)),
      explode(options, ALL_OPTS), // depends on code, but code depends on a subset of ALL_OPTS
    );

    if (!data) {
      return null;
    }

    return createElement('img', {
      src: data,
      style: STYLES,
      className: options.className,
    });
  };
