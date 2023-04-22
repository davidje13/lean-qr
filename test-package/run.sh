#!/bin/sh
set -e

BASE_DIR="$(cd "$(dirname "$0")/.."; pwd)";
cd "$BASE_DIR";

echo "Building library...";
echo;
npm run build;

measure() {
  printf "$(wc -c < "$1") bytes";
  if which zip >/dev/null; then
    printf " / $(zip -jqX9 - "$1" | wc -c) bytes (compressed)";
  fi;
}

{
  printf "core esm:               $(measure build/index.mjs)\n";
  printf "core cjs:               $(measure build/index.js)\n";
  printf "extras/svg esm:         $(measure build/extras/svg.mjs)\n";
  printf "extras/svg cjs:         $(measure build/extras/svg.js)\n";
  printf "extras/node_export esm: $(measure build/extras/node_export.mjs)\n";
  printf "extras/node_export cjs: $(measure build/extras/node_export.js)\n";
  printf "extras/react esm:       $(measure build/extras/react.mjs)\n";
  printf "extras/react cjs:       $(measure build/extras/react.js)\n";
} > docs/stats.txt;

echo "Running package test...";
echo;

rm /lean-qr-*.tgz 2>/dev/null || true;
npm pack;
rm test-package/lean-qr.tgz 2>/dev/null || true;
mv lean-qr-*.tgz test-package/lean-qr.tgz;
cd - >/dev/null;

cd "$BASE_DIR/test-package";
rm -rf node_modules/lean-qr || true;
npm install --audit=false;
rm lean-qr.tgz || true;
npm test;
cd - >/dev/null;

echo;
echo "Package test complete";
cat "$BASE_DIR/docs/stats.txt";
echo;
