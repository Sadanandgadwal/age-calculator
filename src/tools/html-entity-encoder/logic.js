export const MODES = [
  { id: 'encode', name: 'Encode' },
  { id: 'decode', name: 'Decode' },
];

const ESSENTIAL = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function encodeEntities(text, allNonAscii = false) {
  const escaped = text.replace(/[&<>"']/g, (character) => ESSENTIAL[character]);
  return allNonAscii ? escaped.replace(/\P{ASCII}/gu, (character) => `&#${character.codePointAt(0)};`) : escaped;
}

export function decodeEntities(text) {
  const area = document.createElement('textarea');
  area.innerHTML = text;
  return area.value;
}

export function evaluate(modeId, text, allNonAscii) {
  if (!text) return null;
  return modeId === 'encode' ? encodeEntities(text, allNonAscii) : decodeEntities(text);
}

export const buildReport = (modeId, allNonAscii, output) => ({
  inputs: [
    { label: 'Action', value: MODES.find(({ id }) => id === modeId).name },
    ...(modeId === 'encode' ? [{ label: 'Encode all non-English characters', value: allNonAscii ? 'Yes' : 'No' }] : []),
  ],
  results: [{ label: 'Characters in the result', value: output.length.toLocaleString('en-GB') }],
  text: { title: modeId === 'encode' ? 'Encoded text' : 'Decoded text', value: output, mono: true },
});
