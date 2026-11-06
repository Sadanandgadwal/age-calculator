import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'package.json'));
const packageDir = (name) => dirname(require.resolve(`${name}/package.json`));
const { version } = JSON.parse(readFileSync(join(packageDir('tesseract.js'), 'package.json'), 'utf8'));
const target = join(root, 'public', 'ocr', version);
const core = packageDir('tesseract.js-core');

const files = [
  [join(packageDir('tesseract.js'), 'dist', 'worker.min.js'), 'worker.min.js'],
  ...['tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'].map((name) => [join(core, name), name]),
  [join(packageDir('@tesseract.js-data/eng'), '4.0.0_best_int', 'eng.traineddata.gz'), 'eng.traineddata.gz'],
];

mkdirSync(target, { recursive: true });
for (const [from, name] of files) copyFileSync(from, join(target, name));
console.log(`Copied ${files.length} OCR files to public/ocr/${version}`);
