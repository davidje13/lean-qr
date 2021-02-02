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
    padByte(): void;
  }

  export interface Bitmap2D {
    readonly size: number;

    get(x: number, y: number): boolean;

    toString(options?: {
      on?: string,
      off?: string,
      lf?: string,
      padX?: number,
      padY?: number,
    }): string;

    toImageData<DataT extends ImageDataLike>(context: Context2DLike<DataT>, options?: {
      on?: number,
      off?: number,
    }): DataT;

    toCanvas(canvas: CanvasLike<ImageDataLike>, options?: {
      on?: number,
      off?: number,
      padX?: number,
      padY?: number,
    }): void;
  }

  export type Mask = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
  export type Mode = (data: Bitmap1D, version: number) => void;

  export const mode: {
    multi(...modes: Mode[]): Mode,
    numeric(value: string): Mode,
    alphaNumeric(value: string): Mode,
    iso8859_1(value: string): Mode,
  };

  export enum correction {
    min = 0,
    L = 0,
    M = 1,
    Q = 2,
    H = 3,
    max = 3,
  }

  export const generate: (data: Mode, options?: {
    minCorrectionLevel?: correction;
    maxCorrectionLevel?: correction;
    minVersion?: number;
    maxVersion?: number;
    mask?: null | Mask;
  }) => Bitmap2D;
}
