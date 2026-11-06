import { useEffect, useState } from 'react';
import { Contact } from 'lucide-react';
import * as content from './content.js';
import { DPI, PAPERS, PRESETS, PRINT_NOTE, RULES_NOTE, buildReport, getFacts, getPaper, getPreset, headGuide, isLowResolution, mmToPx, readCustomSize, setJpegDpi, sheetLayout } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CropArea from '../../components/common/CropArea.jsx';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import useImageFile from '../../hooks/useImageFile.js';
import { initialCrop } from '../../utils/cropBox.js';
import { saveBlob } from '../../utils/download.js';
import { drawToCanvas, encodeCanvas, outputFilename } from '../../utils/imageFile.js';

const RENDER_DELAY_MS = 250;
const PRINT_AREA = { width: 186, height: 130 };

async function toJpeg(canvas) {
  const blob = await encodeCanvas(canvas, 'image/jpeg', 0.95);
  return new Blob([setJpegDpi(new Uint8Array(await blob.arrayBuffer()))], { type: 'image/jpeg' });
}

function readDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('The photo could not be prepared.'));
    reader.readAsDataURL(blob);
  });
}

function drawSheet(photoCanvas, paper, size) {
  const layout = sheetLayout(paper, size);
  const canvas = document.createElement('canvas');
  canvas.width = mmToPx(paper.width);
  canvas.height = mmToPx(paper.height);
  const context = canvas.getContext('2d');
  context.fillStyle = '#ffffff';
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.strokeStyle = '#c8c8c8';
  context.lineWidth = 1;
  for (const position of layout.positions) {
    const x = mmToPx(position.x);
    const y = mmToPx(position.y);
    context.drawImage(photoCanvas, x, y, photoCanvas.width, photoCanvas.height);
    context.strokeRect(x - 0.5, y - 0.5, photoCanvas.width + 1, photoCanvas.height + 1);
  }
  return canvas;
}

export default function PassportPhotoMakerPage() {
  const { source, error, choose, clear } = useImageFile();
  const [presetId, setPresetId] = useState(PRESETS[0].id);
  const [paperId, setPaperId] = useState(PAPERS[0].id);
  const [customWidth, setCustomWidth] = useState('35');
  const [customHeight, setCustomHeight] = useState('45');
  const [crop, setCrop] = useState(null);
  const [outcome, setOutcome] = useState(null);

  const preset = getPreset(presetId);
  const paper = getPaper(paperId);
  const custom = presetId === 'custom' ? readCustomSize(customWidth, customHeight) : null;
  const size = custom ? custom.size : { width: preset.width, height: preset.height };
  const ratio = size ? size.width / size.height : null;

  const handleFile = async (file) => {
    setCrop(null);
    setOutcome(null);
    const opened = await choose(file);
    if (opened && ratio) setCrop(initialCrop(opened.width, opened.height, ratio, 0.9));
  };

  const changePreset = (id) => {
    setPresetId(id);
    const next = getPreset(id);
    const nextSize = id === 'custom' ? readCustomSize(customWidth, customHeight).size : next;
    if (source && nextSize) setCrop(initialCrop(source.width, source.height, nextSize.width / nextSize.height, 0.9));
  };

  const changeCustom = (setter, field) => (value) => {
    setter(value);
    const next = readCustomSize(field === 'width' ? value : customWidth, field === 'height' ? value : customHeight).size;
    if (source && next) setCrop(initialCrop(source.width, source.height, next.width / next.height, 0.9));
  };

  const key = source && crop && size ? [crop.x, crop.y, crop.width, crop.height, size.width, size.height, paperId].join(',') : null;

  useEffect(() => {
    if (!key) return undefined;
    let isCurrent = true;
    const [x, y, width, height, photoWidth, photoHeight, chosenPaper] = key.split(',');
    const timer = setTimeout(async () => {
      try {
        const area = { x: Number(x), y: Number(y), width: Number(width), height: Number(height) };
        const photoSize = { width: Number(photoWidth), height: Number(photoHeight) };
        const photoCanvas = drawToCanvas(source.image, { crop: area, width: mmToPx(photoSize.width), height: mmToPx(photoSize.height), background: '#ffffff' });
        const photo = await toJpeg(photoCanvas);
        const sheetPaper = getPaper(chosenPaper);
        const sheet = await toJpeg(drawSheet(photoCanvas, sheetPaper, photoSize));
        const photoUrl = await readDataUrl(photo);
        if (isCurrent) setOutcome({ key, photo, sheet, photoUrl, crop: area, size: photoSize, count: sheetLayout(sheetPaper, photoSize).count });
      } catch (failure) {
        if (isCurrent) setOutcome({ key, error: failure.message });
      }
    }, RENDER_DELAY_MS);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [key, source]);

  const current = outcome?.key === key ? outcome : null;
  const guide = size && headGuide(size, preset.head);
  const printCount = current && sheetLayout(PRINT_AREA, current.size, 0, 2).count;

  const getPrintReport = () => ({
    ...buildReport(preset, current.size, printCount),
    visual: (
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2mm', justifyContent: 'center' }}>
        {Array.from({ length: printCount }, (_, index) => (
          <img key={index} src={current.photoUrl} alt="" style={{ width: `${current.size.width}mm`, height: `${current.size.height}mm`, outline: '0.2mm solid #c8c8c8' }} />
        ))}
      </div>
    ),
  });

  const reset = () => {
    clear();
    setCrop(null);
    setOutcome(null);
    setPresetId(PRESETS[0].id);
    setPaperId(PAPERS[0].id);
    setCustomWidth('35');
    setCustomHeight('45');
  };

  return (
    <ToolLayout toolId="passport-photo-maker" content={content}>
      <TextToolShell
        formLabel="Choose a photo and size"
        onClear={reset}
        panel={{ title: 'Passport Photo', icon: Contact, emptyText: 'Choose a photo taken against a plain, light background.' }}
        results={
          source &&
          crop &&
          size &&
          (current?.photo ? (
            <div className="mt-5">
              <div className="grid place-items-center rounded-2xl bg-page p-4">
                <img src={current.photoUrl} alt="Your passport photo" style={{ aspectRatio: `${current.size.width} / ${current.size.height}` }} className="h-48 w-auto border border-line" />
              </div>
              <FactList items={getFacts(preset, current.size, current.crop, paper, current.count)} />
              {isLowResolution(current.crop, current.size) && <p className="mt-3 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">The selected area has fewer pixels than a {DPI} DPI print needs, so the photo may look blurry. Use a sharper or closer photo if you can.</p>}
              <p className="mt-3 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{RULES_NOTE} This tool does not change the background.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DownloadButton onClick={() => saveBlob(current.photo, outputFilename(source.name, 'passport', 'image/jpeg'))}>Download photo</DownloadButton>
                <DownloadButton onClick={() => saveBlob(current.sheet, outputFilename(source.name, `sheet-${paperId}`, 'image/jpeg'))}>Download sheet</DownloadButton>
              </div>
              <p className="mt-3 text-sm font-medium text-ink/80">{PRINT_NOTE}</p>
              <ResultActions printOnly getReport={getPrintReport} getText={() => ''} />
            </div>
          ) : current?.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <p role="status" className="px-4 py-12 text-center font-bold">Preparing your photo…</p>
          ))
        }
      >
        <FileDropZone id="passport-file" label="Choose or drop a photo" hint="JPG or PNG, up to 25 MB. It stays on your device." accept="image/*" onFile={handleFile} error={error} />
        <SegmentedControl label="Document" options={PRESETS} value={presetId} onChange={changePreset} />
        {presetId === 'custom' && (
          <div className="grid grid-cols-2 gap-3">
            <CalculatorInput id="passport-width" label="Width" suffix="mm" value={customWidth} onChange={changeCustom(setCustomWidth, 'width')} error={custom?.errors.width} />
            <CalculatorInput id="passport-height" label="Height" suffix="mm" value={customHeight} onChange={changeCustom(setCustomHeight, 'height')} error={custom?.errors.height} />
          </div>
        )}
        <SegmentedControl label="Print sheet" options={PAPERS} value={paperId} onChange={setPaperId} />
        {source && crop && (
          <CropArea blob={source.file} imageWidth={source.width} imageHeight={source.height} crop={crop} onChange={setCrop} ratio={ratio} label="Photo area">
            {guide && (
              <span
                aria-hidden="true"
                style={{ top: `${guide.top * 100}%`, height: `${guide.height * 100}%`, width: `${guide.width * 100}%` }}
                className="pointer-events-none absolute left-1/2 -translate-x-1/2 rounded-[50%] border-2 border-dashed border-white/90"
              />
            )}
          </CropArea>
        )}
        {source && crop && guide && <p className="-mt-3 text-sm text-ink/80">Fit the head, from chin to the top of the hair, inside the dashed oval.</p>}
      </TextToolShell>
    </ToolLayout>
  );
}
