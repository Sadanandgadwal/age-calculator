import { encodeWav } from './logic.js';

const AudioContextClass = () => globalThis.AudioContext ?? globalThis.webkitAudioContext;

export async function decodeAudio(file) {
  const Context = AudioContextClass();
  if (!Context) throw new Error('This browser cannot convert audio.');
  const context = new Context();
  try {
    return await context.decodeAudioData(await file.arrayBuffer());
  } catch {
    throw new Error('This audio could not be read. The format may not be supported by this browser, or the file may be damaged.');
  } finally {
    context.close?.();
  }
}

export async function renderWav(buffer, { start, end, rate, mono }) {
  const sampleRate = rate === 'keep' ? buffer.sampleRate : Number(rate);
  const channels = mono ? 1 : buffer.numberOfChannels;
  const length = Math.max(1, Math.round((end - start) * sampleRate));
  const offline = new OfflineAudioContext(channels, length, sampleRate);
  const source = offline.createBufferSource();
  source.buffer = buffer;
  source.connect(offline.destination);
  source.start(0, start, end - start);
  const rendered = await offline.startRendering();
  const data = Array.from({ length: channels }, (_, index) => rendered.getChannelData(index));
  const bytes = encodeWav(data, sampleRate);
  return { blob: new Blob([bytes], { type: 'audio/wav' }), duration: length / sampleRate, sampleRate, channels, size: bytes.length };
}
