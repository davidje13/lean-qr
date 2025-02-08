export function strip(keyword) {
  const pattern = new RegExp(
    `/[/*] *begin-${keyword}.*?end-${keyword}(\\*/|\\n)`,
    'gs',
  );
  return { transform: (source) => ({ code: source.replaceAll(pattern, '') }) };
}
