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

{
  printf "core esm:               $(measure "$BASE_DIR/build/index.mjs")\n";
  printf "core cjs:               $(measure "$BASE_DIR/build/index.js")\n";
  printf "extras/svg esm:         $(measure "$BASE_DIR/build/extras/svg.mjs")\n";
  printf "extras/svg cjs:         $(measure "$BASE_DIR/build/extras/svg.js")\n";
  printf "extras/node_export esm: $(measure "$BASE_DIR/build/extras/node_export.mjs")\n";
  printf "extras/node_export cjs: $(measure "$BASE_DIR/build/extras/node_export.js")\n";
  printf "extras/react esm:       $(measure "$BASE_DIR/build/extras/react.mjs")\n";
  printf "extras/react cjs:       $(measure "$BASE_DIR/build/extras/react.js")\n";
} > "$BASE_DIR/docs/stats.txt";

echo "Packaging...";
echo;

cd "$BASE_DIR/build";
npm pack;
cd - >/dev/null;

rm "$BASE_DIR/package.tgz" 2>/dev/null || true;
mv "$BASE_DIR/build/lean-qr-"*.tgz "$BASE_DIR/package.tgz";
rm -r "$BASE_DIR/build";
