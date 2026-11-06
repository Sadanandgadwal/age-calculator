import { version } from 'pdfjs-dist/package.json';
import { describePdfError } from './pdfFile.js';

const ASSETS = `/pdfjs/${version}`;
let library;

async function loadLibrary() {
  if (!library) {
    library = Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    });
  }
  return library;
}

export async function openForRendering(bytes, password) {
  const pdfjs = await loadLibrary();
  const task = pdfjs.getDocument({
    data: bytes.slice(),
    password,
    isEvalSupported: false,
    enableXfa: false,
    cMapUrl: `${ASSETS}/cmaps/`,
    cMapPacked: true,
    standardFontDataUrl: `${ASSETS}/standard_fonts/`,
    wasmUrl: `${ASSETS}/wasm/`,
    iccUrl: `${ASSETS}/iccs/`,
  });
  try {
    return await task.promise;
  } catch (error) {
    if (error?.name === 'PasswordException') throw new Error(error.code === 2 ? describePdfError(new Error('Password incorrect')) : describePdfError({ name: 'EncryptedPDFError' }), { cause: error });
    throw new Error(describePdfError(error), { cause: error });
  }
}

export async function renderPage(pdf, pageNumber, { scale = 1, width, background = '#ffffff' } = {}) {
  const page = await pdf.getPage(pageNumber);
  const base = page.getViewport({ scale: 1 });
  const viewport = page.getViewport({ scale: width ? width / base.width : scale });
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.floor(viewport.width));
  canvas.height = Math.max(1, Math.floor(viewport.height));
  const context = canvas.getContext('2d');
  context.fillStyle = background;
  context.fillRect(0, 0, canvas.width, canvas.height);
  await page.render({ canvasContext: context, canvas, viewport }).promise;
  page.cleanup();
  return canvas;
}

export async function readPageText(pdf, pageNumber) {
  const page = await pdf.getPage(pageNumber);
  const content = await page.getTextContent();
  page.cleanup();
  return content.items;
}
