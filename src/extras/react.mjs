const hasChange = (a, b, props) => props.some((prop) => a[prop] !== b[prop]);

const GENERATE_OPTS = [
  'minCorrectionLevel',
  'maxCorrectionLevel',
  'minVersion',
  'maxVersion',
  'mask',
  'modes',
];

const CANVAS_OPTS = ['on', 'off', 'padX', 'padY'];

export const makeComponent =
  (framework, generate) =>
  ({ content, ...options }) => {
    const canvasRef = framework.useRef(null);
    const codeRef = framework.useRef(null);
    const optionsRef = framework.useRef({});
    framework.useEffect(() => {
      const regen = hasChange(options, optionsRef.current, GENERATE_OPTS);
      if (regen) {
        codeRef.current = generate(content, options);
      }
      if (regen || hasChange(options, optionsRef.current, CANVAS_OPTS)) {
        codeRef.current.toCanvas(canvasRef.current, options);
        optionsRef.current = options;
      }
    }, [content, options]);
    return framework.createElement('canvas', {
      ref: canvasRef,
      style: { 'image-rendering': 'pixelated' },
    });
  };
