export const readError = (error) =>
  (typeof error === 'object'
    ? '|No data|Bad version range|Bad error correction range|Too much data|Data cannot be encoded using requested modes'.split(
        '|',
      )[error.code] || error.message
    : `${error}`) || 'Unknown error';
