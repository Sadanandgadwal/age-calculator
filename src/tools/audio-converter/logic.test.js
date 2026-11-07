import { describe, expect, it } from 'vitest';
import { MAX_SECONDS, checkAudioFile, encodeWav, formatSeconds, getFacts, readTrim, wavName } from './logic.js';

describe('checkAudioFile', () => {
  it('accepts audio by type or name', () => {
    expect(checkAudioFile(new File(['x'], 'song.mp3', { type: 'audio/mpeg' }))).toBeNull();
    expect(checkAudioFile(new File(['x'], 'voice.m4a', { type: '' }))).toBeNull();
    expect(checkAudioFile(new File(['x'], 'notes.txt', { type: 'text/plain' }))).toBe('Please choose an audio file, such as MP3, M4A, OGG or WAV.');
    expect(checkAudioFile(new File([], 'empty.mp3', { type: 'audio/mpeg' }))).toBe('This file is empty. Please choose another one.');
  });
});

describe('readTrim', () => {
  it('uses the whole audio by default', () => {
    expect(readTrim('', '', 10)).toEqual({ errors: {}, start: 0, end: 10 });
  });

  it('trims and keeps the end within the audio', () => {
    expect(readTrim('2', '20', 10)).toEqual({ errors: {}, start: 2, end: 10 });
  });

  it('explains bad trims', () => {
    expect(readTrim('5', '2', 10).errors).toEqual({ end: 'The end must be after the start.' });
    expect(readTrim('12', '', 10).errors).toEqual({ start: 'The start must be before the end of the audio (10 s).' });
    expect(readTrim('x', '-1', 10).errors).toEqual({ start: 'Please enter a number of seconds, 0 or more.', end: 'Please enter a number of seconds, 0 or more.' });
    expect(readTrim('', '', MAX_SECONDS + 1).errors.end).toBe('Please keep the converted audio to 15 minutes or less.');
  });
});

describe('encodeWav', () => {
  it('writes a valid 16-bit WAV header and samples', () => {
    const bytes = encodeWav([new Float32Array([0, 1]), new Float32Array([-1, 0.5])], 16000);
    const view = new DataView(bytes.buffer);
    const text = (start, end) => String.fromCharCode(...bytes.slice(start, end));
    expect([text(0, 4), text(8, 12), text(36, 40)]).toEqual(['RIFF', 'WAVE', 'data']);
    expect(view.getUint16(22, true)).toBe(2);
    expect(view.getUint32(24, true)).toBe(16000);
    expect(view.getUint32(40, true)).toBe(8);
    expect([view.getInt16(44, true), view.getInt16(46, true), view.getInt16(48, true), view.getInt16(50, true)]).toEqual([0, -32768, 32767, 16384]);
  });

  it('clips samples outside the range', () => {
    const view = new DataView(encodeWav([new Float32Array([2, -2])], 8000).buffer);
    expect([view.getInt16(44, true), view.getInt16(46, true)]).toEqual([32767, -32768]);
  });
});

describe('formatting', () => {
  it('formats times, names and facts', () => {
    expect(formatSeconds(75.25)).toBe('1 min 15.3 s');
    expect(formatSeconds(4)).toBe('4 s');
    expect(wavName('My song.mp3')).toBe('My song-converted.wav');
    expect(getFacts({ duration: 1, sampleRate: 16000, channels: 1, size: 32044 }, { size: 192044 }).map(({ value }) => value)).toEqual(['1 s', '16,000 Hz', 'Mono', 'WAV, 16-bit PCM', '31.3 KB (original 187.5 KB)']);
  });
});
