#!/bin/sh
set -e

BASE_DIR="$(cd "$(dirname "$0")/.."; pwd)";

echo "Cleaning build...";
rm -r "$BASE_DIR/build" "$BASE_DIR/web/build" 2>/dev/null || true;

echo "Building library...";
echo;

cd "$BASE_DIR";
npx rollup --config rollup.config.mjs;
cd - >/dev/null;

chmod +x "$BASE_DIR/build/cli.mjs";
cp "$BASE_DIR/README.md" "$BASE_DIR/LICENSE" "$BASE_DIR/index.d.ts" "$BASE_DIR/build";
./tools/map-package-json.mjs < "$BASE_DIR/package.json" > "$BASE_DIR/build/package.json";

measure() {
  printf "$(wc -c < "$1") bytes";
  if which zip >/dev/null; then
    printf " / $(zip -jqX9 - "$1" | wc -c) bytes (compressed)";
  fi;
}

FILES="index.mjs index.js extras/svg.mjs extras/svg.js extras/node_export.mjs extras/node_export.js extras/react.mjs extras/react.js webcomponent.mjs";

for FILE in $FILES; do
  printf "%-24s%s\n" "$FILE:" "$(measure "$BASE_DIR/build/$FILE")";
done > "$BASE_DIR/docs/stats.txt";

for FILE in $FILES; do
  printf "%-24s%s\n" "$FILE:" "sha384-$(< "$BASE_DIR/build/$FILE" openssl dgst -sha384 -binary | openssl base64 -A)";
done > "$BASE_DIR/docs/integrity.txt";

echo "Packaging...";
echo;

cd "$BASE_DIR/build";
npm pack;
cd - >/dev/null;

rm "$BASE_DIR/package.tgz" 2>/dev/null || true;
mv "$BASE_DIR/build/lean-qr-"*.tgz "$BASE_DIR/package.tgz";
rm -r "$BASE_DIR/build";
