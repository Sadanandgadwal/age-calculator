import { useRef, useState } from 'react';
import { FileImage } from 'lucide-react';
import * as content from './content.js';
import { MARGINS, MAX_IMAGES, PAGE_SIZES, getFacts, layoutImage } from './logic.js';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import FileList from '../../components/common/FileList.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { saveBlob } from '../../utils/download.js';
import { drawToCanvas, encodeCanvas, formatBytes, openImage } from '../../utils/imageFile.js';
import { moveItem } from '../../utils/moveItem.js';
import { loadPdfLib, savePdf } from '../../utils/pdfFile.js';

async function embedImage(output, item) {
  if (item.type === 'image/png') return output.embedPng(new Uint8Array(await item.file.arrayBuffer()));
  const canvas = drawToCanvas(item.image, { background: '#ffffff' });
  const jpeg = await encodeCanvas(canvas, 'image/jpeg', 0.92);
  return output.embedJpg(new Uint8Array(await jpeg.arrayBuffer()));
}

export default function JpgToPdfPage() {
  const [items, setItems] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [error, setError] = useState();
  const [sizeId, setSizeId] = useState(PAGE_SIZES[1].id);
  const [marginId, setMarginId] = useState(MARGINS[0].id);
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const nextId = useRef(0);
  const latest = useRef(0);

  const addFiles = async (files) => {
    setError(undefined);
    const room = MAX_IMAGES - items.length;
    if (room <= 0) {
      setError(`You can add up to ${MAX_IMAGES} images.`);
      return;
    }
    if (files.length > room) setError(`Only the first ${room} images were added. The limit is ${MAX_IMAGES}.`);
    const request = latest.current;
    setStatus('Reading images…');
    const added = [];
    const failed = [];
    for (const file of files.slice(0, room)) {
      nextId.current += 1;
      try {
        const opened = await openImage(file);
        added.push({ id: nextId.current, name: file.name, file, type: file.type, image: opened.image, width: opened.width, height: opened.height, size: file.size });
      } catch (failure) {
        failed.push({ id: nextId.current, name: file.name, error: failure.message });
      }
    }
    if (request !== latest.current) return;
    setItems((current) => [...current, ...added]);
    setRejected(failed);
    setStatus(null);
  };

  const key = `${items.map((item) => item.id).join(',')}|${sizeId}|${marginId}`;
  const current = result?.key === key ? result : null;

  const create = async () => {
    const request = latest.current;
    setStatus('Creating PDF…');
    try {
      const { PDFDocument } = await loadPdfLib();
      const output = await PDFDocument.create();
      for (const item of items) {
        const embedded = await embedImage(output, item);
        const layout = layoutImage(item.width, item.height, sizeId, marginId);
        output.addPage(layout.page).drawImage(embedded, layout.image);
      }
      const blob = await savePdf(output);
      if (request === latest.current) setResult({ key, blob, facts: getFacts(items.length, blob) });
    } catch (failure) {
      if (request === latest.current) setResult({ key, error: failure.message });
    }
    if (request === latest.current) setStatus(null);
  };

  const clear = () => {
    latest.current += 1;
    setItems([]);
    setRejected([]);
    setError(undefined);
    setStatus(null);
    setResult(null);
    setSizeId(PAGE_SIZES[1].id);
    setMarginId(MARGINS[0].id);
  };

  return (
    <ToolLayout toolId="jpg-to-pdf" content={content}>
      <TextToolShell
        formLabel="Choose images and options"
        onClear={clear}
        panel={{ title: 'Your PDF', icon: FileImage, emptyText: 'Add images, put them in order, then create the PDF.' }}
        results={
          current &&
          (current.error ? (
            <p role="alert" className="mt-5 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{current.error}</p>
          ) : (
            <div className="mt-5">
              <FactList items={current.facts} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, 'images.pdf')}>Download PDF</DownloadButton>
              </div>
            </div>
          ))
        }
      >
        <FileDropZone id="pdf-images" label="Choose or drop images" hint={`JPG, PNG or WebP, up to ${MAX_IMAGES} images. They stay on your device.`} accept="image/*" multiple onFiles={addFiles} error={error} />
        {rejected.length > 0 && (
          <ul aria-label="Images not added" className="rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">
            {rejected.map((item) => (
              <li key={item.id}>
                <strong>{item.name}:</strong> {item.error}
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          <FileList
            label="Images, in page order"
            items={items.map((item) => ({ id: item.id, name: item.name, detail: `${item.width} × ${item.height} px · ${formatBytes(item.size)}` }))}
            onMove={(index, delta) => setItems((list) => moveItem(list, index, delta))}
            onRemove={(index) => setItems((list) => list.filter((_, position) => position !== index))}
          />
        )}
        <SegmentedControl label="Page size" options={PAGE_SIZES} value={sizeId} onChange={setSizeId} />
        <SegmentedControl label="Margin" options={MARGINS} value={marginId} onChange={setMarginId} />
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={FileImage} onClick={create} disabled={items.length === 0 || Boolean(status)}>
          Create PDF
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
