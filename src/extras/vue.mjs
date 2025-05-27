const GENERATE_OPTS = [
  'minCorrectionLevel',
  'maxCorrectionLevel',
  'minVersion',
  'maxVersion',
  'mask',
  'trailer',
  'modes',
];

const DISPLAY_OPTS = ['on', 'off', 'pad', 'width', 'height', 'scale'];

const dataOrError = (fn) => {
  try {
    return fn();
  } catch (e) {
    console.warn(e.message);
    // implicit return undefined;
  }
};

const BAD_FRAMEWORK = 'Bad framework';
const BAD_GENERATE = 'Bad generate';
const BAD_SVG = 'Bad toSvgDataURL';

const fail = (m) => {
  throw new TypeError(m);
};

const extract = (o, props) =>
  Object.fromEntries(
    props.map((k) => [k, o[k]]).filter(([_, v]) => v !== undefined),
  );
const STYLES = 'image-rendering:pixelated';

const COMMON = {
  props: ['content', ...GENERATE_OPTS, ...DISPLAY_OPTS],
  expose: [],
};

export const makeVueCanvasComponent = (
  { h } = fail(BAD_FRAMEWORK),
  generate = fail(BAD_GENERATE),
  defaultOptions = {},
) => ({
  name: 'LeanQRCanvas',
  ...COMMON,
  computed: {
    qr() {
      return dataOrError(() =>
        generate(this.content, {
          ...defaultOptions,
          ...extract(this, GENERATE_OPTS),
        }),
      );
    },
    d() {
      return [
        this.qr,
        {
          ...defaultOptions,
          ...extract(this, DISPLAY_OPTS),
        },
      ];
    },
  },
  mounted() {
    this.$watch(
      'd',
      ([code, options]) => {
        this.$refs['o'].hidden = !code;
        code?.toCanvas(this.$refs['o'], options);
      },
      { immediate: true, flush: 'post' },
    );
  },
  render: () => h('canvas', { ref: 'o', style: STYLES }),
});

export const makeVueSvgComponent = (
  { h } = fail(BAD_FRAMEWORK),
  generate = fail(BAD_GENERATE),
  toSvgDataURL = fail(BAD_SVG),
  defaultOptions = {},
) => ({
  name: 'LeanQRSvg',
  ...COMMON,
  computed: {
    qr() {
      return dataOrError(() =>
        generate(this.content, {
          ...defaultOptions,
          ...extract(this, GENERATE_OPTS),
        }),
      );
    },
    u() {
      return (
        this.qr &&
        dataOrError(() =>
          toSvgDataURL(this.qr, {
            ...defaultOptions,
            ...extract(this, DISPLAY_OPTS),
          }),
        )
      );
    },
  },
  render() {
    return this.u ? h('img', { src: this.u, style: STYLES }) : null;
  },
});
