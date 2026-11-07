import { useEffect, useState } from 'react';
import { FileImage, Images } from 'lucide-react';
import * as content from './content.js';
import { DEFAULT_QUALITY, FORMATS, canEncode, convertedName, describeResult, getFormat, pickFiles, transparencyNote, uniqueNames } from './logic.js';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import FileList from '../../components/common/FileList.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { saveBlob } from '../../utils/download.js';
import { drawToCanvas, encodeCanvas, formatBytes, openImage } from '../../utils/imageFile.js';
import { createZip } from '../../utils/zipStore.js';

let nextId = 1;

export default function ImageConverterPage() {
  const [files, setFiles] = useState([]);
  const [problems, setProblems] = useState([]);
  const [formatId, setFormatId] = useState('image/webp');
  const [quality, setQuality] = useState(DEFAULT_QUALITY);
  const [status, setStatus] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [avif, setAvif] = useState(false);

  useEffect(() => {
    let active = true;
    canEncode('image/avif').then((supported) => active && setAvif(supported));
    return () => {
      active = false;
    };
  }, []);

  const options = FORMATS.filter((item) => item.id !== 'image/avif' || avif);

  const format = getFormat(formatId);
  const key = `${files.map(({ id }) => id).join(',')}|${formatId}|${format.lossy ? quality : ''}`;
  const current = outcome?.key === key ? outcome : null;

  const add = (incoming) => {
    const { accepted, problems: found } = pickFiles(files, incoming);
    setProblems(found);
    setFiles((list) => [...list, ...accepted.map((file) => ({ id: nextId++, name: file.name, file }))]);
  };

  const convert = async () => {
    const results = [];
    for (const [index, { id, file }] of files.entries()) {
      setStatus(`Converting image ${index + 1} of ${files.length}…`);
      try {
        const opened = await openImage(file);
        const canvas = drawToCanvas(opened.image, { background: formatId === 'image/jpeg' ? '#ffffff' : undefined });
        const blob = await encodeCanvas(canvas, formatId, format.lossy ? quality / 100 : undefined);
        canvas.width = 0;
        canvas.height = 0;
        results.push({ id, name: file.name, size: file.size, type: file.type, width: opened.width, height: opened.height, blob });
      } catch (failure) {
        results.push({ id, name: file.name, error: failure.message });
        if (failure.unsupported) break;
      }
    }
    const names = uniqueNames(results.map((item) => convertedName(item.name, formatId)));
    const items = results.map((item, index) => ({ ...item, output: names[index] }));
    const done = items.filter((item) => item.blob);
    const zip = done.length > 1 ? createZip(await Promise.all(done.map(async (item) => ({ name: item.output, data: new Uint8Array(await item.blob.arrayBuffer()) })))) : null;
    setOutcome({ key, items, zip });
    setStatus(null);
  };

  const reset = () => {
    setFiles([]);
    setProblems([]);
    setOutcome(null);
    setQuality(DEFAULT_QUALITY);
    setFormatId('image/webp');
  };

  const converted = current?.items.filter((item) => item.blob) ?? [];
  const note = current ? transparencyNote(converted, formatId) : null;

  return (
    <ToolLayout toolId="image-converter" content={content}>
      <TextToolShell
        formLabel="Choose images and a format"
        onClear={reset}
        panel={{ title: 'Converted Images', icon: Images, emptyText: 'Choose images and a format, then select Convert images.' }}
        results={
          current && (
            <div className="mt-5 flex flex-col gap-3">
              <ul aria-label="Converted images" className="flex flex-col gap-3">
                {current.items.map((item) => (
                  <li key={item.id} className="rounded-xl bg-page px-4 py-3">
                    <p className="font-bold break-all">{item.blob ? item.output : item.name}</p>
                    {item.blob ? (
                      <>
                        <p className="mt-1 text-sm">{describeResult(item)}</p>
                        <div className="mt-2">
                          <DownloadButton onClick={() => saveBlob(item.blob, item.output)}>Download {item.output}</DownloadButton>
                        </div>
                      </>
                    ) : (
                      <p role="alert" className="mt-1 text-sm font-medium text-danger">{item.error}</p>
                    )}
                  </li>
                ))}
              </ul>
              {note && <p className="rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{note}</p>}
              {current.zip && <DownloadButton onClick={() => saveBlob(current.zip, 'converted-images.zip')}>Download all as ZIP ({formatBytes(current.zip.size)})</DownloadButton>}
            </div>
          )
        }
      >
        <FileDropZone id="convert-files" label="Choose or drop images" hint="Up to 20 images, 25 MB each. They stay on your device." accept="image/*" multiple onFiles={add} error={problems.length ? problems.join(' ') : null} />
        {files.length > 0 && (
          <FileList
            label="Images to convert"
            items={files.map(({ id, name, file }) => ({ id, name, detail: formatBytes(file.size) }))}
            onRemove={(index) => setFiles((list) => list.filter((_, position) => position !== index))}
          />
        )}
        <SegmentedControl label="Convert to" options={options} value={formatId} onChange={setFormatId} />
        {format.lossy && (
          <div>
            <label htmlFor="convert-quality" className="flex items-center justify-between text-sm font-bold text-ink">
              Quality
              <output htmlFor="convert-quality">{quality}%</output>
            </label>
            <input id="convert-quality" type="range" min={10} max={100} step={5} value={quality} onChange={(event) => setQuality(Number(event.target.value))} className="mt-2 h-11 w-full cursor-pointer accent-primary" />
          </div>
        )}
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={FileImage} onClick={convert} disabled={files.length === 0 || Boolean(status)}>
          Convert images
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
