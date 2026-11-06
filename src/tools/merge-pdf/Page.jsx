import { useRef, useState } from 'react';
import { Combine } from 'lucide-react';
import * as content from './content.js';
import { describeFile, getFacts, orderKey } from './logic.js';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import FileList from '../../components/common/FileList.jsx';
import PrimaryButton from '../../components/common/PrimaryButton.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { saveBlob } from '../../utils/download.js';
import { moveItem } from '../../utils/moveItem.js';
import { MAX_PDF_FILES, loadPdfLib, openPdf, savePdf } from '../../utils/pdfFile.js';

export default function MergePdfPage() {
  const [items, setItems] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [error, setError] = useState();
  const [status, setStatus] = useState(null);
  const [result, setResult] = useState(null);
  const nextId = useRef(0);
  const latest = useRef(0);

  const addFiles = async (files) => {
    setError(undefined);
    const room = MAX_PDF_FILES - items.length;
    if (room <= 0) {
      setError(`You can merge up to ${MAX_PDF_FILES} files at once.`);
      return;
    }
    if (files.length > room) setError(`Only the first ${room} files were added. The limit is ${MAX_PDF_FILES}.`);
    const request = latest.current;
    setStatus('Reading files…');
    const added = [];
    const failed = [];
    for (const file of files.slice(0, room)) {
      nextId.current += 1;
      try {
        const opened = await openPdf(file);
        added.push({ id: nextId.current, name: file.name, size: file.size, pageCount: opened.pageCount, document: opened.document });
      } catch (failure) {
        failed.push({ id: nextId.current, name: file.name, error: failure.message });
      }
    }
    if (request !== latest.current) return;
    setItems((current) => [...current, ...added]);
    setRejected(failed);
    setStatus(null);
  };

  const merge = async () => {
    const request = latest.current;
    setStatus('Merging…');
    setError(undefined);
    try {
      const { PDFDocument } = await loadPdfLib();
      const output = await PDFDocument.create();
      for (const item of items) {
        const pages = await output.copyPages(item.document, item.document.getPageIndices());
        pages.forEach((page) => output.addPage(page));
      }
      const blob = await savePdf(output);
      if (request !== latest.current) return;
      setResult({ key: orderKey(items), blob, facts: getFacts(items, blob) });
    } catch (failure) {
      if (request === latest.current) setError(failure.message);
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
  };

  const current = result?.key === orderKey(items) ? result : null;

  return (
    <ToolLayout toolId="merge-pdf" content={content}>
      <TextToolShell
        formLabel="Choose PDFs to merge"
        onClear={clear}
        panel={{ title: 'Merged PDF', icon: Combine, emptyText: 'Add two or more PDFs, put them in order, then merge.' }}
        results={
          current && (
            <div className="mt-5">
              <FactList items={current.facts} />
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(current.blob, 'merged.pdf')}>Download PDF</DownloadButton>
              </div>
            </div>
          )
        }
      >
        <FileDropZone id="merge-files" label="Choose or drop PDF files" hint={`Up to ${MAX_PDF_FILES} files, 100 MB each. They stay on your device.`} accept="application/pdf,.pdf" multiple onFiles={addFiles} error={error} />
        {rejected.length > 0 && (
          <ul aria-label="Files not added" className="rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">
            {rejected.map((item) => (
              <li key={item.id}>
                <strong>{item.name}:</strong> {item.error}
              </li>
            ))}
          </ul>
        )}
        {items.length > 0 && (
          <FileList
            label="Files to merge, in order"
            items={items.map((item) => ({ id: item.id, name: item.name, detail: describeFile(item) }))}
            onMove={(index, delta) => setItems((list) => moveItem(list, index, delta))}
            onRemove={(index) => setItems((list) => list.filter((_, position) => position !== index))}
          />
        )}
        {status && <p role="status" className="text-sm font-bold">{status}</p>}
        <PrimaryButton icon={Combine} onClick={merge} disabled={items.length < 2 || Boolean(status)}>
          Merge PDFs
        </PrimaryButton>
      </TextToolShell>
    </ToolLayout>
  );
}
