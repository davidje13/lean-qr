#!/bin/sh
set -e

echo "Running package test...";
echo;

BASE_DIR="$(cd "$(dirname "$0")/.."; pwd)";
cd "$BASE_DIR";
rm /lean-qr-*.tgz 2>/dev/null || true;
npm pack;
rm test-package/lean-qr.tgz 2>/dev/null || true;
mv lean-qr-*.tgz test-package/lean-qr.tgz;
cd - >/dev/null;

cd "$BASE_DIR/test-package";
rm -rf node_modules || true;
npm install --audit=false;
rm lean-qr.tgz || true;
npm test --ignore-scripts=false; # ignore-scripts is over-zealous on Node 14
cd - >/dev/null;

echo;
echo "Package test complete";
echo;
