#!/bin/sh
set -e

cd "$(dirname "$0")"

npm run build;

measure() {
  printf "$(wc -c < "$1") bytes";
  if which zip >/dev/null; then
    printf " / $(zip -jqX9 - "$1" | wc -c) bytes (compressed)";
  fi;
}

{
  echo "lean-qr" | tee /dev/stderr
  printf "size: $(measure ../build/index.js)\n";
  performance/lean-qr.mjs;

  echo "qrcode" | tee /dev/stderr
  printf "size: $(measure node_modules/qrcode/build/qrcode.js)\n";
  printf "shift-jis plugin size: $(measure node_modules/qrcode/build/qrcode.tosjis.js)\n";
  performance/qrcode.mjs;

  echo "qr.js" | tee /dev/stderr
  printf "size: $(measure build/qrjs.js)\n";
  performance/qrjs.mjs;

  echo "qrcode-generator" | tee /dev/stderr
  printf "size: $(measure node_modules/qrcode-generator/qrcode.js)\n";
  performance/qrcode-generator.mjs;

  echo "qr-creator" | tee /dev/stderr
  printf "size: $(measure node_modules/qr-creator/dist/qr-creator.es6.min.js)\n";
} > results.txt;

cat results.txt;

echo "test qr-creator by running 'npm start' and opening http://localhost:8081/performance/qr-creator.html"
