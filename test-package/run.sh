#!/bin/sh
set -e

BASE_DIR="$(cd "$(dirname "$0")/.."; pwd)";
cd "$BASE_DIR";

echo "Building library...";
echo;
npm run build;
RAW_SIZE="$(wc -c < build/index.js)";
COMPRESSED_SIZE="$(zip -jqX9 - build/index.js | wc -c)";

printf "Library size:    $RAW_SIZE bytes\nCompressed size: $COMPRESSED_SIZE bytes\n" > docs/stats.txt;

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
