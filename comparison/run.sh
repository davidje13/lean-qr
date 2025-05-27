#!/bin/sh
set -e

BASE_DIR="$(cd "$(dirname "$0")/.."; pwd)";
"$BASE_DIR/tools/build.sh";

echo "Preparing...";
echo;

# Install dependencies
rm "$BASE_DIR/comparison/lean-qr.tgz" 2>/dev/null || true;
cp "$BASE_DIR/package.tgz" "$BASE_DIR/comparison/lean-qr.tgz";
rm -r "$BASE_DIR/comparison/node_modules/lean-qr" 2>/dev/null || true;
cd "$BASE_DIR/comparison";
npm install --no-package-lock --ignore-scripts --audit=false;
rm lean-qr.tgz || true;

# Prepare directory structure / clear old results
rm -r results build || true;
mkdir -p results;
mkdir -p build;

# Copy/transpile files to use into build folder
cp node_modules/lean-qr/index.mjs build/lean-qr.mjs;
cp node_modules/lean-qr/nano.mjs build/lean-qr-nano.mjs;
cp node_modules/qrcode-generator/qrcode.js build/qrcode-generator.js;
cp node_modules/qr-creator/dist/qr-creator.es6.min.js build/qr-creator.mjs;
cp node_modules/awesome-qr/dist/awesome-qr.js build/awesome-qr.js;
curl -L https://github.com/nayuki/QR-Code-generator/releases/download/v1.8.0/qrcodegen-v1.8.0-es6.js > build/qr-code-generator.js;
cp node_modules/qrjs2/js/qrjs2.js build/qrjs2.js;
npm run --silent build;

echo;
echo "Running size comparisons...";
echo;

measure() {
  printf "$(wc -c < "$1") bytes";
  if which zip >/dev/null; then
    printf " / $(zip -jqX9 - "$1" | wc -c) bytes (compressed)";
  fi;
}

{
  printf "lean-qr:                    $(measure build/lean-qr.mjs)\n";
  printf "lean-qr/nano:               $(measure build/lean-qr-nano.mjs)\n";
  printf "lean-qr png:                $(measure node_modules/lean-qr/extras/png.mjs)\n";
  printf "lean-qr svg:                $(measure node_modules/lean-qr/extras/svg.mjs)\n";
  printf "qrcode:                     $(measure build/qrcode.browser.mjs)\n";
  printf "qrcode shift-jis:           $(measure node_modules/qrcode/helper/to-sjis.js)\n";
  printf "qr.js:                      $(measure build/qrjs.mjs)\n";
  printf "qrcode-generator:           $(measure build/qrcode-generator.js)\n";
  printf "qrcode-generator shift-jis: $(measure node_modules/qrcode-generator/qrcode_SJIS.js)\n";
  printf "qr-creator:                 $(measure build/qr-creator.mjs)\n";
  printf "awesome-qr:                 $(measure build/awesome-qr.js)\n";
  printf "qr-code-generator:          $(measure build/qr-code-generator.js)\n";
  printf "qrjs2:                      $(measure build/qrjs2.js)\n";
} | tee results/sizes.txt;

# We (ab)use lean-test to get browser runners for our tests, but to get output from it
# we need the tests to fail, so red X's show our progress as each test "fails"
# (might be worth extending lean-qr to support this use-case more officially)
echo;
echo "Running performance comparisons... (red X's are expected!)";
echo;

for i in $(seq 1 5); do
  echo "Run $i..." >&2;
  npm run --silent performance > "results/performance-$i.txt" || true;
done;

echo;

rm -r build || true;
cat "results/performance-"* | ./analyse-performance.mjs > "results/performance.txt";
cat "results/performance.txt";
cd - >/dev/null;
