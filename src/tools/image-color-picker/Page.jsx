import { useRef, useState } from 'react';
import { Pipette } from 'lucide-react';
import * as content from './content.js';
import { buildReport, describeColor, findMainColors, fitScale, getColorFacts, getText, movePoint, pointFromEvent, sampleScale, toHex } from './logic.js';
import BlobImage from '../../components/common/BlobImage.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import { CHECKERBOARD } from '../../components/common/imagePreview.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { drawToCanvas, openImage } from '../../utils/imageFile.js';

function readPixel(context, { x, y }) {
  const [r, g, b, a] = context.getImageData(x, y, 1, 1).data;
  return { r, g, b, a };
}

function prepare(source) {
  const scale = fitScale(source.width, source.height);
  const width = Math.max(1, Math.round(source.width * scale));
  const height = Math.max(1, Math.round(source.height * scale));
  const context = drawToCanvas(source.image, { width, height }).getContext('2d', { willReadFrequently: true });
  const small = sampleScale(source.width, source.height);
  const sample = drawToCanvas(source.image, { width: Math.max(1, Math.round(source.width * small)), height: Math.max(1, Math.round(source.height * small)) });
  const palette = findMainColors(sample.getContext('2d').getImageData(0, 0, sample.width, sample.height).data);
  return { context, width, height, palette };
}

export default function ImageColorPickerPage() {
  const [picked, setPicked] = useState(null);
  const [point, setPoint] = useState(null);
  const [color, setColor] = useState(null);
  const [error, setError] = useState();
  const latest = useRef(0);

  const pickAt = (next, canvas = picked) => {
    setPoint(next);
    setColor(readPixel(canvas.context, next));
  };

  const clear = () => {
    latest.current += 1;
    setPicked(null);
    setPoint(null);
    setColor(null);
    setError(undefined);
  };

  const handleFile = async (file) => {
    clear();
    const request = latest.current;
    try {
      const source = await openImage(file);
      if (request !== latest.current) return;
      const prepared = { ...prepare(source), file, name: source.name };
      setPicked(prepared);
      pickAt({ x: Math.floor(prepared.width / 2), y: Math.floor(prepared.height / 2) }, prepared);
    } catch (failure) {
      if (request === latest.current) setError(failure.message);
    }
  };

  const onKeyDown = (event) => {
    const next = movePoint(point, event.key, picked.width, picked.height, event.shiftKey);
    if (!next) return;
    event.preventDefault();
    pickAt(next);
  };

  const described = color && describeColor(color);

  return (
    <ToolLayout toolId="image-color-picker" content={content}>
      <TextToolShell
        formLabel="Choose an image"
        onClear={clear}
        panel={{ title: 'Picked Color', icon: Pipette, emptyText: 'Choose an image, then select any point on it.' }}
        results={
          color && (
            <div className="mt-5">
              <div style={CHECKERBOARD} className="overflow-hidden rounded-2xl">
                <div data-testid="swatch" style={{ backgroundColor: `rgba(${color.r}, ${color.g}, ${color.b}, ${color.a / 255})` }} className="h-20" role="img" aria-label={`Color swatch: ${described.hex}`} />
              </div>
              <FactList items={getColorFacts(color)} label="Color values" />
              {picked.palette.length > 0 && (
                <>
                  <h3 className="mt-5 text-sm font-bold print:hidden">Main colors</h3>
                  <ul className="mt-2 grid grid-cols-5 gap-2 print:hidden">
                    {picked.palette.map((item) => (
                      <li key={toHex(item)}>
                        <button
                          type="button"
                          aria-label={`Use ${toHex(item)}, about ${item.share}% of the image`}
                          title={toHex(item)}
                          onClick={() => setColor(item)}
                          style={{ backgroundColor: toHex(item) }}
                          className="h-11 w-full cursor-pointer rounded-xl border-2 border-line outline-none focus-visible:ring-3 focus-visible:ring-mint"
                        />
                      </li>
                    ))}
                  </ul>
                </>
              )}
              <ResultActions getText={() => getText(color, picked.palette)} getReport={() => buildReport(color, picked.palette, picked.name)} />
            </div>
          )
        }
      >
        <FileDropZone id="color-file" label="Choose or drop an image" hint="PNG, JPG, WebP, GIF or SVG, up to 25 MB. It stays on your device." accept="image/*" onFile={handleFile} error={error} />
        {picked && (
          <div>
            <div
              role="application"
              aria-label="Image. Select a point, or use the arrow keys to move. Hold Shift to move by one pixel."
              tabIndex={0}
              onKeyDown={onKeyDown}
              onClick={(event) => pickAt(pointFromEvent(event, event.currentTarget.getBoundingClientRect(), picked.width, picked.height))}
              data-testid="color-image"
              style={CHECKERBOARD}
              className="relative cursor-crosshair overflow-hidden rounded-xl outline-none focus-visible:ring-3 focus-visible:ring-mint"
            >
              <BlobImage blob={picked.file} alt="" className="block w-full select-none" draggable={false} />
              {point && (
                <span
                  aria-hidden="true"
                  style={{ left: `${((point.x + 0.5) / picked.width) * 100}%`, top: `${((point.y + 0.5) / picked.height) * 100}%` }}
                  className="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-[0_0_0_2px_rgba(0,0,0,0.7)]"
                />
              )}
            </div>
            <p className="mt-2 text-sm font-medium text-ink/80">Select a point on the image, or use the arrow keys.</p>
          </div>
        )}
      </TextToolShell>
    </ToolLayout>
  );
}
