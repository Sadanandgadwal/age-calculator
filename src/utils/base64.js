const VALID_BASE64 = /^[A-Za-z0-9+/]*={0,2}$/;
const CHUNK = 0x8000;

function bytesToBinary(bytes) {
  let binary = '';
  for (let start = 0; start < bytes.length; start += CHUNK) binary += String.fromCharCode(...bytes.subarray(start, start + CHUNK));
  return binary;
}

export function encodeBase64(text, urlSafe = false) {
  const encoded = btoa(bytesToBinary(new TextEncoder().encode(text)));
  return urlSafe ? encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '') : encoded;
}

export function decodeBase64Bytes(text) {
  const cleaned = text.replace(/\s/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const unpadded = cleaned.replace(/=+$/, '');
  if (!VALID_BASE64.test(cleaned) || unpadded.length % 4 === 1) return { error: 'This is not valid Base64.' };

  const binary = atob(unpadded.padEnd(Math.ceil(unpadded.length / 4) * 4, '='));
  return { bytes: Uint8Array.from(binary, (character) => character.charCodeAt(0)) };
}

export function decodeBase64(text) {
  const { error, bytes } = decodeBase64Bytes(text);
  if (error) return { error };
  try {
    return { output: new TextDecoder('utf-8', { fatal: true }).decode(bytes) };
  } catch {
    return { error: 'This Base64 decodes to binary data, such as an image or file, not to text.' };
  }
}
