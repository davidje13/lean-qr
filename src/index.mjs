export { correction } from './qr/options/corrections.mjs';
import {
  multi,
  eci,
  bytes,
  numeric,
  alphaNumeric,
  ascii,
  iso8859_1,
  utf8,
  shift_jis,
  auto,
} from './qr/options/modes.mjs';
export { generate } from './qr/generate.mjs';

export const mode = {
  multi,
  eci,
  bytes,
  numeric,
  alphaNumeric,
  ascii,
  iso8859_1,
  utf8,
  shift_jis,
  auto,
};
