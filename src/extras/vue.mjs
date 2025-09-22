import {
  fail,
  ERROR_BAD_GENERATE,
  ERROR_BAD_TO_SVG_DATA_URL,
  ERROR_BAD_FRAMEWORK,
} from '../util.mjs';

const GENERATE_OPTS = [
  'minCorrectionLevel',
  'maxCorrectionLevel',
  'minVersion',
  'maxVersion',
  'mask',
  'trailer',
  'modes',
];

const DISPLAY_OPTS = [
  'on',
  'off',
  'pad',
  'padX',
  'padY',
  'width',
  'height',
  'scale',
];

const dataOrError = (fn) => {
  try {
    return fn();
  } catch (e) {
    console.warn(e.message);
    // implicit return undefined;
  }
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
  { h } = fail(ERROR_BAD_FRAMEWORK),
  generate = fail(ERROR_BAD_GENERATE),
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
  { h } = fail(ERROR_BAD_FRAMEWORK),
  generate = fail(ERROR_BAD_GENERATE),
  toSvgDataURL = fail(ERROR_BAD_TO_SVG_DATA_URL),
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
