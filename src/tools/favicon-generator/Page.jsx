import { useEffect, useState } from 'react';
import { Globe } from 'lucide-react';
import * as content from './content.js';
import { BACKGROUNDS, FITS, ICONS, ICO_SIZES, SNIPPET, buildIco, buildManifest, isHexColor, placement } from './logic.js';
import BlobImage from '../../components/common/BlobImage.jsx';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import { CHECKERBOARD } from '../../components/common/imagePreview.js';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import useImageFile from '../../hooks/useImageFile.js';
import { saveBlob } from '../../utils/download.js';
import { encodeCanvas } from '../../utils/imageFile.js';
import { createZip } from '../../utils/zipStore.js';

const RENDER_DELAY_MS = 200;
const MASTER_SIZE = 1024;
const PREVIEW_SIZES = [16, 32, 48, 180];

function drawMaster(image, fitId) {
  const { source, target } = placement(image.naturalWidth, image.naturalHeight, MASTER_SIZE, fitId);
  const canvas = document.createElement('canvas');
  canvas.width = MASTER_SIZE;
  canvas.height = MASTER_SIZE;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('This browser could not prepare the image.');
  context.imageSmoothingQuality = 'high';
  context.drawImage(image, source.x, source.y, source.width, source.height, target.x, target.y, target.width, target.height);
  return canvas;
}

function drawIcon(master, size, background) {
  let current = master;
  while (current.width / 2 >= size * 1.5) {
    const half = document.createElement('canvas');
    half.width = Math.round(current.width / 2);
    half.height = half.width;
    const context = half.getContext('2d');
    context.imageSmoothingQuality = 'high';
    context.drawImage(current, 0, 0, half.width, half.height);
    current = half;
  }
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const context = canvas.getContext('2d');
  if (background) {
    context.fillStyle = background;
    context.fillRect(0, 0, size, size);
  }
  context.imageSmoothingQuality = 'high';
  context.drawImage(current, 0, 0, size, size);
  return canvas;
}

async function buildIcons(image, fitId, color) {
  const master = drawMaster(image, fitId);
  const pngs = {};
  for (const icon of ICONS) {
    const canvas = drawIcon(master, icon.size, color ?? (icon.opaque ? '#ffffff' : null));
    pngs[icon.name] = new Uint8Array(await (await encodeCanvas(canvas, 'image/png')).arrayBuffer());
  }
  const ico = buildIco(ICO_SIZES.map((size) => ({ size, bytes: pngs[`favicon-${size}x${size}.png`] })));
  return { pngs, ico };
}

export default function FaviconGeneratorPage() {
  const { source, error, choose, clear } = useImageFile();
  const [fitId, setFitId] = useState(FITS[0].id);
  const [backgroundId, setBackgroundId] = useState(BACKGROUNDS[0].id);
  const [color, setColor] = useState('#ffffff');
  const [siteName, setSiteName] = useState('');
  const [outcome, setOutcome] = useState(null);

  const fill = backgroundId === 'color' ? color : null;
  const settings = `${fitId}|${fill}`;

  useEffect(() => {
    if (!source) return undefined;
    let isCurrent = true;
    const [fit, chosen] = settings.split('|');
    const timer = setTimeout(async () => {
      try {
        const icons = await buildIcons(source.image, fit, chosen === 'null' ? null : chosen);
        if (isCurrent) setOutcome({ source, settings, ...icons });
      } catch (failure) {
        if (isCurrent) setOutcome({ source, settings, error: failure.message });
      }
    }, RENDER_DELAY_MS);
    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [source, settings]);

  const current = outcome?.source === source && outcome?.settings === settings ? outcome : null;
  const manifest = buildManifest(siteName, fill ?? '#ffffff');

  const downloadZip = () => {
    const files = [
      { name: 'favicon.ico', data: current.ico },
      ...ICONS.map((icon) => ({ name: icon.name, data: current.pngs[icon.name] })),
      { name: 'site.webmanifest', data: manifest },
      { name: 'favicon-tags.html', data: `${SNIPPET}\n` },
    ];
    saveBlob(createZip(files), 'favicons.zip');
  };

  const reset = () => {
    clear();
    setOutcome(null);
    setFitId(FITS[0].id);
    setBackgroundId(BACKGROUNDS[0].id);
    setColor('#ffffff');
    setSiteName('');
  };

  return (
    <ToolLayout toolId="favicon-generator" content={content}>
      <TextToolShell
        formLabel="Choose an image and options"
        onClear={reset}
        panel={{ title: 'Your Favicons', icon: Globe, emptyText: 'Choose a square logo or image to make your icons.' }}
        results={
          source &&
          (current?.ico ? (
            <div className="mt-5">
              <ul aria-label="Icon previews" className="flex flex-wrap items-end gap-4 rounded-2xl p-4" style={CHECKERBOARD}>
                {PREVIEW_SIZES.map((size) => (
                  <li key={size} className="flex flex-col items-center gap-1">
                    <BlobImage blob={new Blob([current.pngs[ICONS.find((icon) => icon.size === size).name]], { type: 'image/png' })} alt={`${size} by ${size} pixel icon`} width={Math.min(size, 96)} height={Math.min(size, 96)} />
                    <span className="rounded bg-white px-1 text-xs font-bold">{size} px</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-sm font-medium text-ink/80">The ZIP has favicon.ico (16, 32 and 48 px), six PNG icons, site.webmanifest and the HTML tags. Put the files in the root folder of your site.</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <DownloadButton onClick={downloadZip}>Download ZIP</DownloadButton>
                <DownloadButton onClick={() => saveBlob(new Blob([current.ico], { type: 'image/x-icon' }), 'favicon.ico')}>Download favicon.ico</DownloadButton>
              </div>
              <TextOutput label="HTML to add" value={SNIPPET} className="font-mono" />
            </div>
          ) : current?.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <p role="status" className="px-4 py-12 text-center font-bold">Making icons…</p>
          ))
        }
      >
        <FileDropZone id="favicon-file" label="Choose or drop an image" hint="A square PNG or SVG at least 512 px works best. It stays on your device." accept="image/*" onFile={choose} error={error} />
        <SegmentedControl label="Shape" options={FITS} value={fitId} onChange={setFitId} />
        <SegmentedControl label="Background" options={BACKGROUNDS} value={backgroundId} onChange={setBackgroundId} />
        {backgroundId === 'color' && (
          <div>
            <label htmlFor="favicon-color" className="block text-sm font-bold text-ink">Background color</label>
            <input id="favicon-color" type="color" value={color} onChange={(event) => isHexColor(event.target.value) && setColor(event.target.value)} className="mt-2 h-12 w-24 cursor-pointer rounded-xl border-2 border-line bg-white p-1" />
          </div>
        )}
        <CalculatorInput id="favicon-name" label="Site name (optional, for the manifest)" inputMode="text" value={siteName} onChange={setSiteName} maxLength={60} />
      </TextToolShell>
    </ToolLayout>
  );
}
