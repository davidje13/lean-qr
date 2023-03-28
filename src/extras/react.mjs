const hasChange = (a, b, props) => props.some((prop) => a[prop] !== b[prop]);
const explode = (o, props) => props.map((prop) => o[prop]);

const GENERATE_OPTS = [
  'content',
  'minCorrectionLevel',
  'maxCorrectionLevel',
  'minVersion',
  'maxVersion',
  'mask',
  'modes',
];

const ALL_OPTS = [...GENERATE_OPTS, 'on', 'off', 'padX', 'padY'];

export const makeDynamicComponent = (framework, generate) => (props) => {
  const canvasRef = framework.useRef(null);
  const codeRef = framework.useRef([null, {}]);
  framework.useEffect(() => {
    if (hasChange(props, codeRef.current[1], GENERATE_OPTS)) {
      codeRef.current = [generate(props.content, props), props];
    }
    codeRef.current[0].toCanvas(canvasRef.current, props);
  }, explode(props, ALL_OPTS));
  return framework.createElement('canvas', {
    ref: canvasRef,
    style: { 'image-rendering': 'pixelated' },
    className: props.className,
  });
};

export const makeStaticComponent =
  (framework, generate, toSvgDataURL) => (props) => {
    const code = framework.useMemo(
      () => generate(props.current, props),
      explode(props, GENERATE_OPTS),
    );
    const data = framework.useMemo(
      () => toSvgDataURL(code, props),
      [code, ...explode(props, ALL_OPTS)],
    );

    return framework.createElement('img', {
      src: data,
      style: { 'image-rendering': 'pixelated' },
      className: props.className,
    });
  };
