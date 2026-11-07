import { formatBytes } from '../../utils/imageFile.js';

export const MIN_PASSWORD = 4;
export const STRONG_PASSWORD = 10;
export const MAX_PASSWORD = 127;

export function checkPasswords(password, confirmation) {
  const errors = {};
  if (password.length < MIN_PASSWORD) errors.password = `Please use at least ${MIN_PASSWORD} characters.`;
  else if (password.length > MAX_PASSWORD) errors.password = `Please use at most ${MAX_PASSWORD} characters.`;
  if (!errors.password && confirmation !== password) errors.confirmation = 'The passwords do not match.';
  return errors;
}

export const isWeak = (password) => password.length < STRONG_PASSWORD;

export function buildPermissions({ allowPrinting, allowCopying }) {
  return {
    printing: allowPrinting ? 'highResolution' : false,
    copying: allowCopying,
    modifying: false,
    annotating: false,
    fillingForms: true,
    contentAccessibility: true,
    documentAssembly: false,
  };
}

export function getFacts({ allowPrinting, allowCopying }, blob) {
  return [
    { label: 'Encryption', value: 'AES-256' },
    { label: 'Printing', value: allowPrinting ? 'Allowed' : 'Not allowed' },
    { label: 'Copying text', value: allowCopying ? 'Allowed' : 'Not allowed' },
    { label: 'File size', value: formatBytes(blob.size) },
  ];
}
