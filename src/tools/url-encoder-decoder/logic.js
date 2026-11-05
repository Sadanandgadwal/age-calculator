export const MODES = [
  { id: 'encode', name: 'Encode' },
  { id: 'decode', name: 'Decode' },
];

export const SCOPES = [
  { id: 'component', name: 'A single value' },
  { id: 'url', name: 'A whole URL' },
];

export function evaluate({ modeId, scopeId, text, plusAsSpace }) {
  if (!text) return { error: null, output: null };
  const isComponent = scopeId === 'component';
  try {
    if (modeId === 'encode') return { error: null, output: isComponent ? encodeURIComponent(text) : encodeURI(text) };
    const prepared = plusAsSpace ? text.replace(/\+/g, ' ') : text;
    return { error: null, output: isComponent ? decodeURIComponent(prepared) : decodeURI(prepared) };
  } catch {
    return {
      error: modeId === 'decode' ? 'This has a broken percent code, such as a % not followed by two hex digits.' : 'This text has a broken character and could not be encoded.',
      output: null,
    };
  }
}

export const buildReport = ({ modeId, scopeId, plusAsSpace }, output) => ({
  inputs: [
    { label: 'Action', value: MODES.find(({ id }) => id === modeId).name },
    { label: 'Applies to', value: SCOPES.find(({ id }) => id === scopeId).name },
    ...(modeId === 'decode' ? [{ label: 'Plus signs as spaces', value: plusAsSpace ? 'Yes' : 'No' }] : []),
  ],
  results: [{ label: 'Characters in the result', value: output.length.toLocaleString('en-GB') }],
  text: { title: modeId === 'encode' ? 'Encoded text' : 'Decoded text', value: output, mono: true },
});
