export const makeUint8Array = (size) => new Uint8Array(size);
export const fail = (code) => {
  const error = new Error(`lean-qr error ${code}`);
  error.code = code;
  throw error;
};

export const ERROR_NO_DATA = 1;
export const ERROR_INVALID_VERSION_RANGE = 2;
export const ERROR_INVALID_ERROR_CORRECTION_RANGE = 3;
export const ERROR_TOO_MUCH_DATA = 4;
export const ERROR_UNENCODABLE = 5;
