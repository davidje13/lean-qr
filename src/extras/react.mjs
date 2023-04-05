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

const ALL_OPTS = [...GENERATE_OPTS, 'on', 'off', 'padX', 'padY'];
const STYLES = { 'image-rendering': 'pixelated' };

export const makeAsyncComponent =
  (
    { createElement, useEffect, useRef } = fail(ERROR_BAD_FRAMEWORK),
    generate = fail(ERROR_BAD_GENERATE),
    defaultOptions = {},
  ) =>
  (props) => {
    const options = { ...defaultOptions, ...props };
    const canvasRef = useRef(null);
    const codeRef = useRef([null, {}]);
    useEffect(() => {
      try {
        if (hasChange(options, codeRef.current[1], GENERATE_OPTS)) {
          codeRef.current[0] = generate(options.content, options);
        }
        codeRef.current[0].toCanvas(canvasRef.current, options);
        canvasRef.current.hidden = false;
      } catch (e) {
        console.warn(e.message);
        canvasRef.current.hidden = true;
      }
      codeRef.current[1] = options;
    }, explode(options, ALL_OPTS));

    return createElement('canvas', {
      ref: canvasRef,
      style: STYLES,
      className: options.className,
    });
  };

const dataOrError = (fn) => {
  try {
    return fn();
  } catch (e) {
    console.warn(e.message);
    return undefined;
  }
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
      [code, ...explode(options, ALL_OPTS)],
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
