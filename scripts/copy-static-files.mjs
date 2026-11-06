import { copyFileSync, cpSync, mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(join(root, 'package.json'));
const packageDir = (name) => dirname(require.resolve(`${name}/package.json`));
const versionOf = (name) => JSON.parse(readFileSync(join(packageDir(name), 'package.json'), 'utf8')).version;

const ocrTarget = join(root, 'public', 'ocr', versionOf('tesseract.js'));
const core = packageDir('tesseract.js-core');
const ocrFiles = [
  [join(packageDir('tesseract.js'), 'dist', 'worker.min.js'), 'worker.min.js'],
  ...['tesseract-core-lstm.wasm.js', 'tesseract-core-simd-lstm.wasm.js', 'tesseract-core-relaxedsimd-lstm.wasm.js'].map((name) => [join(core, name), name]),
  [join(packageDir('@tesseract.js-data/eng'), '4.0.0_best_int', 'eng.traineddata.gz'), 'eng.traineddata.gz'],
];
mkdirSync(ocrTarget, { recursive: true });
for (const [from, name] of ocrFiles) copyFileSync(from, join(ocrTarget, name));

const pdfSource = packageDir('pdfjs-dist');
const pdfTarget = join(root, 'public', 'pdfjs', versionOf('pdfjs-dist'));
for (const folder of ['cmaps', 'standard_fonts', 'iccs']) cpSync(join(pdfSource, folder), join(pdfTarget, folder), { recursive: true });
mkdirSync(join(pdfTarget, 'wasm'), { recursive: true });
for (const name of readdirSync(join(pdfSource, 'wasm')).filter((file) => !file.startsWith('quickjs') && !file.includes('QUICKJS'))) copyFileSync(join(pdfSource, 'wasm', name), join(pdfTarget, 'wasm', name));

console.log('Copied OCR and PDF viewer files to public/');
