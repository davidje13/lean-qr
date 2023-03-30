import {
  ERROR_NO_DATA,
  ERROR_INVALID_VERSION_RANGE,
  ERROR_INVALID_ERROR_CORRECTION_RANGE,
  ERROR_TOO_MUCH_DATA,
  ERROR_UNENCODABLE,
  ERROR_BAD_FRAMEWORK,
  ERROR_BAD_GENERATE,
  ERROR_BAD_TO_SVG_DATA_URL,
} from '../util.mjs';

const MESSAGES = {
  [ERROR_NO_DATA]: 'No data',
  [ERROR_INVALID_VERSION_RANGE]: 'Bad version range',
  [ERROR_INVALID_ERROR_CORRECTION_RANGE]: 'Bad error correction range',
  [ERROR_TOO_MUCH_DATA]: 'Too much data',
  [ERROR_UNENCODABLE]: 'Data cannot be encoded using requested modes',
  [ERROR_BAD_FRAMEWORK]: 'Bad framework',
  [ERROR_BAD_GENERATE]: 'Bad generate function',
  [ERROR_BAD_TO_SVG_DATA_URL]: 'Bad toSvgDataURL function',
};

export const readError = (error) => {
  if (typeof error !== 'object') {
    return `${error}` || 'Unknown error';
  }
  return MESSAGES[error.code] || error.message || 'Unknown error';
};
