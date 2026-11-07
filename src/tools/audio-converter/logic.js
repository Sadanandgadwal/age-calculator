import { formatBytes } from '../../utils/imageFile.js';
import { parseDecimal } from '../../utils/number.js';

export const MAX_AUDIO_BYTES = 100 * 1024 * 1024;
export const MAX_SECONDS = 15 * 60;

export const RATES = [
  { id: 'keep', name: 'Keep' },
  { id: '44100', name: '44.1 kHz' },
  { id: '22050', name: '22 kHz' },
  { id: '16000', name: '16 kHz' },
];

export const CHANNELS = [
  { id: 'keep', name: 'Keep' },
  { id: 'mono', name: 'Mono' },
];

export function checkAudioFile(file) {
  const looksLikeAudio = file.type.startsWith('audio/') || file.type === 'video/mp4' || file.type === 'video/webm' || /\.(mp3|wav|ogg|oga|opus|m4a|aac|flac|webm|weba|mp4)$/i.test(file.name);
  if (!looksLikeAudio) return 'Please choose an audio file, such as MP3, M4A, OGG or WAV.';
  if (file.size === 0) return 'This file is empty. Please choose another one.';
  if (file.size > MAX_AUDIO_BYTES) return `This file is larger than ${formatBytes(MAX_AUDIO_BYTES)}. Please choose a smaller one.`;
  return null;
}

export function readTrim(startText, endText, duration) {
  const errors = {};
  const read = (text, key) => {
    if (!String(text ?? '').trim()) return null;
    const value = parseDecimal(text);
    if (value === null || value < 0) {
      errors[key] = 'Please enter a number of seconds, 0 or more.';
      return null;
    }
    return value;
  };
  const start = read(startText, 'start') ?? 0;
  const end = read(endText, 'end') ?? duration;
  if (!errors.start && start >= duration) errors.start = `The start must be before the end of the audio (${formatSeconds(duration)}).`;
  if (!errors.end && !errors.start && end <= start) errors.end = 'The end must be after the start.';
  const clippedEnd = Math.min(end, duration);
  if (!Object.keys(errors).length && clippedEnd - start > MAX_SECONDS) errors.end = 'Please keep the converted audio to 15 minutes or less.';
  return { errors, start, end: clippedEnd };
}

export function formatSeconds(seconds) {
  const whole = Math.round(seconds * 10) / 10;
  const minutes = Math.floor(whole / 60);
  const rest = (whole - minutes * 60).toFixed(1).replace(/\.0$/, '');
  return minutes ? `${minutes} min ${rest} s` : `${rest} s`;
}

export function encodeWav(channels, sampleRate) {
  const frames = channels[0]?.length ?? 0;
  const count = channels.length;
  const dataSize = frames * count * 2;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);
  const text = (offset, value) => [...value].forEach((character, index) => view.setUint8(offset + index, character.charCodeAt(0)));
  text(0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, count, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * count * 2, true);
  view.setUint16(32, count * 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, dataSize, true);
  let offset = 44;
  for (let frame = 0; frame < frames; frame += 1) {
    for (let channel = 0; channel < count; channel += 1) {
      const sample = Math.max(-1, Math.min(1, channels[channel][frame]));
      view.setInt16(offset, sample < 0 ? Math.round(sample * 0x8000) : Math.round(sample * 0x7fff), true);
      offset += 2;
    }
  }
  return new Uint8Array(buffer);
}

export function wavName(name) {
  const base = (name ?? '').replace(/\.[^.]*$/, '').replace(/[^\p{L}\p{M}\p{N}._ -]/gu, '').trim() || 'audio';
  return `${base}-converted.wav`;
}

export function getFacts(output, source) {
  return [
    { label: 'Length', value: formatSeconds(output.duration) },
    { label: 'Sample rate', value: `${output.sampleRate.toLocaleString('en-IN')} Hz` },
    { label: 'Channels', value: output.channels === 1 ? 'Mono' : output.channels === 2 ? 'Stereo' : String(output.channels) },
    { label: 'Format', value: 'WAV, 16-bit PCM' },
    { label: 'File size', value: `${formatBytes(output.size)} (original ${formatBytes(source.size)})` },
  ];
}
