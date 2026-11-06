export const MAX_SIDE = 3000;
export const LOW_CONFIDENCE = 60;

const STEPS = {
  'loading tesseract core': 'Loading the text reader',
  'initializing tesseract': 'Starting the text reader',
  'loading language traineddata': 'Loading English language data',
  'initializing api': 'Starting the text reader',
  'recognizing text': 'Reading the text',
};

export function describeProgress({ status, progress }) {
  const label = STEPS[status] ?? 'Preparing';
  const percent = Math.round((progress ?? 0) * 100);
  return { label, percent: Math.min(100, Math.max(0, percent)) };
}

export function cleanText(text) {
  return text
    .split('\n')
    .map((line) => line.replace(/\s+$/, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export const scaleFor = (width, height) => Math.min(1, MAX_SIDE / Math.max(width, height));

export function getFacts(text, confidence) {
  const words = text.split(/\s+/).filter(Boolean).length;
  const lines = text.split('\n').filter((line) => line.trim()).length;
  return [
    { label: 'Words', value: words.toLocaleString('en-US') },
    { label: 'Lines', value: lines.toLocaleString('en-US') },
    { label: 'Characters', value: text.length.toLocaleString('en-US') },
    { label: 'Confidence', value: `${Math.round(confidence)}%` },
  ];
}

export function getNote(confidence) {
  if (confidence < LOW_CONFIDENCE) return 'The reader was not sure about much of this text, so check it carefully. A sharper, straight, well-lit image usually gives better results.';
  return 'Check the text before you use it, as OCR can misread some characters.';
}

export const textFilename = (name) => `${(name ?? '').replace(/\.[^.]*$/, '') || 'image'}-text.txt`;
