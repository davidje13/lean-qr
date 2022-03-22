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

  export interface Bitmap1D {
    push(value: number, bits: number): void;
  }

  export interface Bitmap2D {
    readonly size: number;

    get(x: number, y: number): boolean;

    toString(options?: {
      on?: string;
      off?: string;
      lf?: string;
      padX?: number;
      padY?: number;
    }): string;

    toImageData<DataT extends ImageDataLike>(
      context: Context2DLike<DataT>,
      options?: {
        on?: number;
        off?: number;
      },
    ): DataT;

    toCanvas(
      canvas: CanvasLike<ImageDataLike>,
      options?: {
        on?: number;
        off?: number;
        padX?: number;
        padY?: number;
      },
    ): void;
  }

  export type Mask = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  export type Mode = (data: Bitmap1D, version: number) => void;
  export interface ModeFactory {
    (value: string): Mode;
    reg: RegExp;
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
    iso8859_1: ModeFactory;
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

  interface GenerateOptions {
    minCorrectionLevel?: correction;
    maxCorrectionLevel?: correction;
    minVersion?: number;
    maxVersion?: number;
    mask?: null | Mask;
  }

  export const generate: (
    data: Mode | string,
    options?: GenerateOptions,
  ) => Bitmap2D;
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

  export const toSvgSource: (code: Bitmap2D, options?: SVGOptions) => string;
}
