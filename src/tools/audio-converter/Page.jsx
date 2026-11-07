import { useEffect, useRef, useState } from 'react';
import { AudioLines } from 'lucide-react';
import * as content from './content.js';
import { decodeAudio, renderWav } from './convertAudio.js';
import { CHANNELS, RATES, checkAudioFile, formatSeconds, getFacts, readTrim, wavName } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { saveBlob } from '../../utils/download.js';
import { formatBytes } from '../../utils/imageFile.js';

function AudioPreview({ blob }) {
  const audio = useRef(null);
  useEffect(() => {
    const url = URL.createObjectURL(blob);
    audio.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [blob]);
  return <audio ref={audio} controls aria-label="Preview of the converted audio" className="mt-4 w-full print:hidden" />;
}

export default function AudioConverterPage() {
  const [source, setSource] = useState(null);
  const [error, setError] = useState(null);
  const [rate, setRate] = useState('keep');
  const [channels, setChannels] = useState('keep');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [status, setStatus] = useState(null);
  const [outcome, setOutcome] = useState(null);

  const trim = source ? readTrim(start, end, source.buffer.duration) : { errors: {} };
  const key = source ? `${source.id}|${rate}|${channels}|${trim.start}|${trim.end}` : null;
  const current = outcome?.key === key ? outcome : null;

  const choose = async (file) => {
    setOutcome(null);
    setSource(null);
    const problem = checkAudioFile(file);
    setError(problem);
    if (problem) return;
    setStatus('Reading the audio…');
    try {
      const buffer = await decodeAudio(file);
      setSource({ id: `${file.name}-${file.size}-${file.lastModified}`, file, buffer });
    } catch (failure) {
      setError(failure.message);
    }
    setStatus(null);
  };

  const convert = async () => {
    setStatus('Converting…');
    try {
      const output = await renderWav(source.buffer, { start: trim.start, end: trim.end, rate, mono: channels === 'mono' });
      setOutcome({ key, output });
    } catch (failure) {
      setOutcome({ key, error: failure instanceof RangeError ? 'This browser ran out of memory. Try a shorter clip.' : 'The audio could not be converted. Please try another file.' });
    }
    setStatus(null);
  };

  const reset = () => {
    setSource(null);
    setError(null);
    setRate('keep');
    setChannels('keep');
    setStart('');
    setEnd('');
    setOutcome(null);
  };

  const hasTrimError = Object.keys(trim.errors).length > 0;

  return (
    <ToolLayout toolId="audio-converter" content={content}>
      <TextToolShell
        formLabel="Choose audio to convert"
        onClear={reset}
        panel={{ title: 'WAV Audio', icon: AudioLines, emptyText: 'Choose an audio file, then select Convert to WAV.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={getFacts(current.output, source.file)} />
              <AudioPreview blob={current.output.blob} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.output.blob, wavName(source.file.name))}>Download WAV</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="audio-file" label="Choose or drop an audio file" hint="MP3, M4A, OGG, WAV and other formats your browser can play, up to 100 MB. It stays on your device." accept="audio/*,.mp3,.m4a,.ogg,.opus,.wav,.flac,.aac,.webm" onFile={choose} error={error} />
        {source && (
          <p className="text-sm">
            <span className="font-bold">{source.file.name}</span>: {formatSeconds(source.buffer.duration)}, {source.buffer.numberOfChannels === 1 ? 'mono' : `${source.buffer.numberOfChannels} channels`}, {source.buffer.sampleRate.toLocaleString('en-IN')} Hz, {formatBytes(source.file.size)}
          </p>
        )}
        <SegmentedControl label="Sample rate" options={RATES} value={rate} onChange={setRate} />
        <SegmentedControl label="Channels" options={CHANNELS} value={channels} onChange={setChannels} />
        <div className="grid gap-3 sm:grid-cols-2">
          <CalculatorInput id="audio-start" label="Start at (seconds, optional)" value={start} onChange={setStart} error={trim.errors.start} />
          <CalculatorInput id="audio-end" label="End at (seconds, optional)" value={end} onChange={setEnd} error={trim.errors.end} />
        </div>
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={AudioLines} onClick={convert} disabled={!source || hasTrimError || Boolean(status)}>
          Convert to WAV
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
