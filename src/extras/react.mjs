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

export const makeDynamicComponent = (framework, generate) => {
  if (!framework.createElement || !framework.useEffect || !framework.useRef) {
    throw new Error('bad framework');
  }
  if (typeof generate !== 'function') {
    throw new Error('bad generate function');
  }
  return (props) => {
    const canvasRef = framework.useRef(null);
    const codeRef = framework.useRef([null, {}]);
    framework.useEffect(() => {
      if (hasChange(props, codeRef.current[1], GENERATE_OPTS)) {
        codeRef.current = [generate(props.content ?? '', props), props];
      }
      if (canvasRef.current) {
        codeRef.current[0].toCanvas(canvasRef.current, props);
      }
    }, explode(props, ALL_OPTS));

    if (props.content === undefined) {
      return null;
    }

    return framework.createElement('canvas', {
      ref: canvasRef,
      style: { 'image-rendering': 'pixelated' },
      className: props.className,
    });
  };
};

export const makeStaticComponent = (framework, generate, toSvgDataURL) => {
  if (!framework.createElement || !framework.useMemo) {
    throw new Error('bad framework');
  }
  if (typeof generate !== 'function') {
    throw new Error('bad generate function');
  }
  if (typeof toSvgDataURL !== 'function') {
    throw new Error('bad toSvgDataURL function');
  }
  return (props) => {
    const code = framework.useMemo(
      () => generate(props.content ?? '', props),
      explode(props, GENERATE_OPTS),
    );
    const data = framework.useMemo(
      () => toSvgDataURL(code, props),
      [code, ...explode(props, ALL_OPTS)],
    );

    if (props.content === undefined) {
      return null;
    }

    return framework.createElement('img', {
      src: data,
      style: { 'image-rendering': 'pixelated' },
      className: props.className,
    });
  };
};
