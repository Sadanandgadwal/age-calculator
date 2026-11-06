import { useEffect, useState } from 'react';
import { Minimize2 } from 'lucide-react';
import * as content from './content.js';
import { DEFAULT_QUALITY, FORMATS, MAX_QUALITY, MIN_QUALITY, getFacts, getNote } from './logic.js';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import ImageResult from '../../components/common/ImageResult.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import useImageFile from '../../hooks/useImageFile.js';
import { drawToCanvas, encodeCanvas, outputFilename } from '../../utils/imageFile.js';

const ENCODE_DELAY_MS = 150;

export default function ImageCompressorPage() {
  const { source, error, choose, clear } = useImageFile();
  const [type, setType] = useState(FORMATS[0].id);
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    if (!source) return undefined;
    let isCurrent = true;
    const timer = setTimeout(async () => {
      try {
        const canvas = drawToCanvas(source.image, { background: type === 'image/jpeg' ? '#ffffff' : undefined });
        const blob = await encodeCanvas(canvas, type, quality / 100);
        if (isCurrent) setOutcome({ source, type, quality, blob });
      } catch (failure) {
        if (isCurrent) setOutcome({ source, type, quality, error: failure.message });
      }
    }, ENCODE_DELAY_MS);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [source, type, quality]);

  const current = outcome?.source === source && outcome?.type === type && outcome?.quality === quality ? outcome : null;

  const reset = () => {
    clear();
    setOutcome(null);
    setQuality(DEFAULT_QUALITY);
    setType(FORMATS[0].id);
  };

  return (
    <ToolLayout toolId="image-compressor" content={content}>
      <TextToolShell
        formLabel="Choose an image and quality"
        onClear={reset}
        panel={{ title: 'Compressed Image', icon: Minimize2, emptyText: 'Choose an image to compress it.' }}
        results={
          source &&
          (current?.blob ? (
            <ImageResult blob={current.blob} filename={outputFilename(source.name, 'compressed', type)} alt="The compressed image" facts={getFacts(source, current.blob, type)} note={getNote(source, current.blob, type)} />
          ) : current?.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <p role="status" className="px-4 py-12 text-center font-bold">Compressing…</p>
          ))
        }
      >
        <FileDropZone id="compress-file" label="Choose or drop an image" hint="JPG, PNG, WebP or GIF, up to 25 MB. It stays on your device." accept="image/*" onFile={choose} error={error} />
        <SegmentedControl label="Output format" options={FORMATS} value={type} onChange={setType} />
        <div>
          <label htmlFor="compress-quality" className="flex items-center justify-between text-sm font-bold text-ink">
            Quality
            <output htmlFor="compress-quality">{quality}%</output>
          </label>
          <input id="compress-quality" type="range" min={MIN_QUALITY} max={MAX_QUALITY} step={5} value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="mt-2 h-11 w-full cursor-pointer accent-primary" />
          <p className="text-sm text-ink/80">A lower quality gives a smaller file. 70 to 80% suits most photos.</p>
        </div>
      </TextToolShell>
    </ToolLayout>
  );
}
