#!/bin/sh
set -e

BASE_DIR="$(cd "$(dirname "$0")/.."; pwd)";
cd "$BASE_DIR";

echo "Building library...";
echo;
npm run build;

{
  printf "core esm:                    $(wc -c < build/index.mjs) bytes\n";
  printf "core cjs:                    $(wc -c < build/index.js) bytes\n";
  printf "core esm compressed:         $(zip -jqX9 - build/index.mjs | wc -c) bytes\n";
  printf "core cjs compressed:         $(zip -jqX9 - build/index.js | wc -c) bytes\n";
  printf "\n";
  printf "extras/svg esm:              $(wc -c < build/extras/svg.mjs) bytes\n";
  printf "extras/svg cjs:              $(wc -c < build/extras/svg.js) bytes\n";
  printf "extras/svg esm compressed:   $(zip -jqX9 - build/extras/svg.mjs | wc -c) bytes\n";
  printf "extras/svg cjs compressed:   $(zip -jqX9 - build/extras/svg.js | wc -c) bytes\n";
  printf "\n";
  printf "extras/react esm:            $(wc -c < build/extras/react.mjs) bytes\n";
  printf "extras/react cjs:            $(wc -c < build/extras/react.js) bytes\n";
  printf "extras/react esm compressed: $(zip -jqX9 - build/extras/react.mjs | wc -c) bytes\n";
  printf "extras/react cjs compressed: $(zip -jqX9 - build/extras/react.js | wc -c) bytes\n";
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
npm test --ignore-scripts=false; # ignore-scripts is over-zealous on Node 14
cd - >/dev/null;

echo;
echo "Package test complete";
cat "$BASE_DIR/docs/stats.txt";
echo;
