import { useEffect, useState } from 'react';
import { Scaling } from 'lucide-react';
import * as content from './content.js';
import { MODES, getFacts, getNote, linkedSize, validateSize } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import ImageResult from '../../components/common/ImageResult.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { CheckField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import useImageFile from '../../hooks/useImageFile.js';
import { drawToCanvas, encodeKeepingFormat, outputFilename } from '../../utils/imageFile.js';

const ENCODE_DELAY_MS = 250;

export default function ImageResizerPage() {
  const { source, error, choose, clear } = useImageFile();
  const [modeId, setModeId] = useState(MODES[0].id);
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [percent, setPercent] = useState('50');
  const [isLocked, setIsLocked] = useState(true);
  const [outcome, setOutcome] = useState(null);

  const handleFile = async (file) => {
    setOutcome(null);
    const opened = await choose(file);
    if (opened) {
      setWidth(String(opened.width));
      setHeight(String(opened.height));
    }
  };

  const changeWidth = (value) => {
    setWidth(value);
    if (isLocked && source) setHeight(linkedSize(value, source.height, source.width));
  };

  const changeHeight = (value) => {
    setHeight(value);
    if (isLocked && source) setWidth(linkedSize(value, source.width, source.height));
  };

  const changeLock = (value) => {
    setIsLocked(value);
    if (value && source) setHeight(linkedSize(width, source.height, source.width));
  };

  const checked = source ? validateSize(source, { modeId, width, height, percent }) : { errors: {} };
  const target = checked.size;
  const targetKey = target ? `${target.width}x${target.height}` : null;

  useEffect(() => {
    if (!source || !targetKey) return undefined;
    let isCurrent = true;
    const [targetWidth, targetHeight] = targetKey.split('x').map(Number);
    const timer = setTimeout(async () => {
      try {
        const isJpeg = source.type === 'image/jpeg';
        const canvas = drawToCanvas(source.image, { width: targetWidth, height: targetHeight, background: isJpeg ? '#ffffff' : undefined });
        const blob = await encodeKeepingFormat(canvas, source.type);
        if (isCurrent) setOutcome({ source, targetKey, blob, size: { width: targetWidth, height: targetHeight } });
      } catch (failure) {
        if (isCurrent) setOutcome({ source, targetKey, error: failure.message });
      }
    }, ENCODE_DELAY_MS);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [source, targetKey]);

  const current = outcome?.source === source && outcome?.targetKey === targetKey ? outcome : null;

  const reset = () => {
    clear();
    setOutcome(null);
    setWidth('');
    setHeight('');
    setPercent('50');
    setIsLocked(true);
    setModeId(MODES[0].id);
  };

  return (
    <ToolLayout toolId="image-resizer" content={content}>
      <TextToolShell
        formLabel="Choose an image and size"
        onClear={reset}
        panel={{ title: 'Resized Image', icon: Scaling, emptyText: 'Choose an image, then enter the new size.' }}
        results={
          source &&
          target &&
          (current?.blob ? (
            <ImageResult blob={current.blob} filename={outputFilename(source.name, `${current.size.width}x${current.size.height}`, current.blob.type)} alt="The resized image" facts={getFacts(source, current.size, current.blob, current.blob.type)} note={getNote(source, current.size, current.blob.type)} />
          ) : current?.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <p role="status" className="px-4 py-12 text-center font-bold">Resizing…</p>
          ))
        }
      >
        <FileDropZone id="resize-file" label="Choose or drop an image" hint="JPG, PNG, WebP or GIF, up to 25 MB. It stays on your device." accept="image/*" onFile={handleFile} error={error} />
        <SegmentedControl label="Resize by" options={MODES} value={modeId} onChange={setModeId} />
        {modeId === 'pixels' ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <CalculatorInput id="resize-width" label="Width" inputMode="numeric" suffix="px" value={width} onChange={changeWidth} error={source ? checked.errors.width : undefined} disabled={!source} />
              <CalculatorInput id="resize-height" label="Height" inputMode="numeric" suffix="px" value={height} onChange={changeHeight} error={source ? checked.errors.height : undefined} disabled={!source} />
            </div>
            <CheckField label="Keep proportions" checked={isLocked} onChange={changeLock} />
          </>
        ) : (
          <CalculatorInput id="resize-percent" label="Percent of the original size" inputMode="numeric" suffix="%" value={percent} onChange={setPercent} error={source ? checked.errors.percent : undefined} disabled={!source} />
        )}
      </TextToolShell>
    </ToolLayout>
  );
}
