import { useEffect, useState } from 'react';
import { Crop } from 'lucide-react';
import * as content from './content.js';
import { cropKey, getFacts, getNote } from './logic.js';
import CropArea from '../../components/common/CropArea.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import ImageResult from '../../components/common/ImageResult.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import useImageFile from '../../hooks/useImageFile.js';
import { RATIOS, initialCrop } from '../../utils/cropBox.js';
import { drawToCanvas, encodeKeepingFormat, outputFilename } from '../../utils/imageFile.js';

const ENCODE_DELAY_MS = 250;
const ratioOf = (id) => RATIOS.find((item) => item.id === id).value;

export default function ImageCropperPage() {
  const { source, error, choose, clear } = useImageFile();
  const [ratioId, setRatioId] = useState(RATIOS[0].id);
  const [crop, setCrop] = useState(null);
  const [outcome, setOutcome] = useState(null);

  const handleFile = async (file) => {
    setCrop(null);
    setOutcome(null);
    const opened = await choose(file);
    if (opened) setCrop(initialCrop(opened.width, opened.height, ratioOf(ratioId)));
  };

  const changeRatio = (id) => {
    setRatioId(id);
    if (source) setCrop(initialCrop(source.width, source.height, ratioOf(id)));
  };

  const key = crop && cropKey(crop);

  useEffect(() => {
    if (!source || !key) return undefined;
    let isCurrent = true;
    const [x, y, width, height] = key.split(',').map(Number);
    const timer = setTimeout(async () => {
      try {
        const canvas = drawToCanvas(source.image, { crop: { x, y, width, height }, background: source.type === 'image/jpeg' ? '#ffffff' : undefined });
        const blob = await encodeKeepingFormat(canvas, source.type);
        if (isCurrent) setOutcome({ source, key, blob, crop: { x, y, width, height } });
      } catch (failure) {
        if (isCurrent) setOutcome({ source, key, error: failure.message });
      }
    }, ENCODE_DELAY_MS);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [source, key]);

  const current = outcome?.source === source && outcome?.key === key ? outcome : null;

  const reset = () => {
    clear();
    setCrop(null);
    setOutcome(null);
    setRatioId(RATIOS[0].id);
  };

  return (
    <ToolLayout toolId="image-cropper" content={content}>
      <TextToolShell
        formLabel="Choose an image and crop it"
        onClear={reset}
        panel={{ title: 'Cropped Image', icon: Crop, emptyText: 'Choose an image, then drag the box to crop it.' }}
        results={
          source &&
          crop &&
          (current?.blob ? (
            <ImageResult blob={current.blob} filename={outputFilename(source.name, 'cropped', current.blob.type)} alt="The cropped image" facts={getFacts(source, current.crop, current.blob)} note={getNote(source, current.blob.type)} />
          ) : current?.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <p role="status" className="px-4 py-12 text-center font-bold">Cropping…</p>
          ))
        }
      >
        <FileDropZone id="crop-file" label="Choose or drop an image" hint="JPG, PNG, WebP or GIF, up to 25 MB. It stays on your device." accept="image/*" onFile={handleFile} error={error} />
        <SegmentedControl label="Shape" options={RATIOS} value={ratioId} onChange={changeRatio} />
        {source && crop && <CropArea blob={source.file} imageWidth={source.width} imageHeight={source.height} crop={crop} onChange={setCrop} ratio={ratioOf(ratioId)} />}
      </TextToolShell>
    </ToolLayout>
  );
}
