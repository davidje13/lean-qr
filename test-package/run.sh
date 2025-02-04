#!/bin/sh
set -e

BASE_DIR="$(cd "$(dirname "$0")/.."; pwd)";
"$BASE_DIR/tools/build.sh";

echo "Running package test...";
echo;

rm "$BASE_DIR/test-package/lean-qr.tgz" 2>/dev/null || true;
cp "$BASE_DIR/package.tgz" "$BASE_DIR/test-package/lean-qr.tgz";
rm -r "$BASE_DIR/test-package/node_modules/lean-qr" 2>/dev/null || true;
cd "$BASE_DIR/test-package";
npm install --audit=false;
rm lean-qr.tgz || true;
npm test;
cd - >/dev/null;

echo;
echo "Package test complete";
cat "$BASE_DIR/docs/stats.txt";
echo;
