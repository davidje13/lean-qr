declare module 'lean-qr' {
  interface ImageDataLike {
    readonly data: Uint8ClampedArray;
  }

  interface Context2DLike<DataT extends ImageDataLike> {
    createImageData(width: number, height: number): DataT;
    putImageData(data: DataT, x: number, y: number): void;
  }

  interface CanvasLike<DataT extends ImageDataLike> {
    width: number;
    height: number;
    getContext(type: '2d'): Context2DLike<DataT> | null;
  }

  export type RGBA = [number, number, number, number?];

  export interface Bitmap1D {
    push(value: number, bits: number): void;
  }

  export interface StringOptions {
    on?: string;
    off?: string;
    lf?: string;
    padX?: number;
    padY?: number;
  }

  export interface ImageDataOptions {
    on?: RGBA;
    off?: RGBA;
    padX?: number;
    padY?: number;
  }

  export interface Bitmap2D {
    readonly size: number;

    get(x: number, y: number): boolean;

    toString(options?: StringOptions): string;

    toImageData<DataT extends ImageDataLike>(
      context: Context2DLike<DataT>,
      options?: ImageDataOptions,
    ): DataT;

    toCanvas(
      canvas: CanvasLike<ImageDataLike>,
      options?: ImageDataOptions,
    ): void;
  }

  export type Mask = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  export type Mode = (data: Bitmap1D, version: number) => void;
  export interface ModeFactory {
    (value: string): Mode;
    test(string: string): boolean;
    est(value: string, version: number): number;
  }

  interface ModeAutoOptions {
    modes?: ReadonlyArray<ModeFactory>;
  }

  export const mode: {
    auto(value: string, options?: ModeAutoOptions): Mode;
    multi(...modes: Mode[]): Mode;
    eci(id: number): Mode;
    numeric: ModeFactory;
    alphaNumeric: ModeFactory;
    bytes(data: Uint8Array | number[]): Mode;
    ascii: ModeFactory;
    iso8859_1: ModeFactory;
    shift_jis: ModeFactory;
    utf8: ModeFactory;
  };

  export enum correction {
    min = 0,
    L = 0,
    M = 1,
    Q = 2,
    H = 3,
    max = 3,
  }

  export interface GenerateOptions extends ModeAutoOptions {
    minCorrectionLevel?: correction;
    maxCorrectionLevel?: correction;
    minVersion?: number;
    maxVersion?: number;
    mask?: null | Mask;
  }

  export type GenerateFn = (
    data: Mode | string,
    options?: GenerateOptions,
  ) => Bitmap2D;
  interface Generate extends GenerateFn {
    with(...modes: ModeFactory[]): GenerateFn;
  }
  export const generate: Generate;
}

declare module 'lean-qr/extras/svg' {
  import type { Bitmap2D } from 'lean-qr';

  interface SVGOptions {
    on?: string;
    off?: string;
    padX?: number;
    padY?: number;
    width?: number;
    height?: number;
    scale?: number;
  }

  export const toSvgPath: (code: Bitmap2D) => string;

  export const toSvg: (
    code: Bitmap2D,
    target: Document | SVGElement,
    options?: SVGOptions,
  ) => SVGElement;

  export const toSvgSource: (
    code: Bitmap2D,
    options?: SVGOptions & { xmlDeclaration?: boolean },
  ) => string;

  export const toSvgDataURL: (code: Bitmap2D, options?: SVGOptions) => string;
}

declare module 'lean-qr/extras/react' {
  import type { ImageDataOptions, GenerateOptions, GenerateFn } from 'lean-qr';

  export interface Framework<T> {
    createElement: (type: string, props: any) => T;
    useRef<T>(initialValue: T | null): { readonly current: T | null };
    useState<S>(initialState: S | (() => S)): [S, (value: S) => void];
    useEffect(fn: () => void | (() => void), deps: unknown[]): void;
  }

  export interface QRComponentProps extends ImageDataOptions, GenerateOptions {
    content: string;
  }

  export type QRComponent<T> = (props: QRComponentProps) => T;

  export const makeComponent: <T>(
    framework: Framework<T>,
    generate: GenerateFn,
  ) => QRComponent<T>;
}
