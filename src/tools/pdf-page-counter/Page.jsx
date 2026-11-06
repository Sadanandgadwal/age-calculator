import { useRef, useState } from 'react';
import { FileDigit } from 'lucide-react';
import * as content from './content.js';
import { buildReport, describeItem, getFacts, getText, summarizeDocument } from './logic.js';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import FileList from '../../components/common/FileList.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { MAX_PDF_FILES, loadPdf, readPdfBytes } from '../../utils/pdfFile.js';

export default function PdfPageCounterPage() {
  const [items, setItems] = useState([]);
  const [error, setError] = useState();
  const [isBusy, setIsBusy] = useState(false);
  const nextId = useRef(0);
  const latest = useRef(0);

  const addFiles = async (files) => {
    setError(undefined);
    const room = MAX_PDF_FILES - items.length;
    if (room <= 0) {
      setError(`You can count up to ${MAX_PDF_FILES} files at once.`);
      return;
    }
    if (files.length > room) setError(`Only the first ${room} files were added. The limit is ${MAX_PDF_FILES}.`);
    const request = latest.current;
    setIsBusy(true);
    const added = [];
    for (const file of files.slice(0, room)) {
      nextId.current += 1;
      const item = { id: nextId.current, name: file.name, size: file.size };
      try {
        const document = await loadPdf(await readPdfBytes(file), { ignoreEncryption: true });
        added.push({ ...item, summary: summarizeDocument(document) });
      } catch (failure) {
        added.push({ ...item, error: failure.message });
      }
    }
    if (request !== latest.current) return;
    setItems((current) => [...current, ...added]);
    setIsBusy(false);
  };

  const clear = () => {
    latest.current += 1;
    setItems([]);
    setError(undefined);
    setIsBusy(false);
  };

  return (
    <ToolLayout toolId="pdf-page-counter" content={content}>
      <TextToolShell
        formLabel="Choose PDF files"
        onClear={clear}
        panel={{ title: 'Page Count', icon: FileDigit, emptyText: 'Choose one or more PDFs to count their pages.' }}
        results={
          items.length > 0 && (
            <div className="mt-5">
              <FactList items={getFacts(items)} />
              <div className="mt-4">
                <FileList label="Counted files" items={items.map((item) => ({ id: item.id, name: item.name, detail: item.summary && describeItem(item), error: item.error }))} onRemove={(index) => setItems((current) => current.filter((_, position) => position !== index))} />
              </div>
              <ResultActions getText={() => getText(items)} getReport={() => buildReport(items)} />
            </div>
          )
        }
      >
        <FileDropZone id="count-files" label="Choose or drop PDF files" hint={`Up to ${MAX_PDF_FILES} files, 100 MB each. They stay on your device.`} accept="application/pdf,.pdf" multiple onFiles={addFiles} error={error} />
        {isBusy && <p role="status" className="text-sm font-bold">Counting pages…</p>}
      </TextToolShell>
    </ToolLayout>
  );
}
