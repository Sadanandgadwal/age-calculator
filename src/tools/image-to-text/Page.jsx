import { useEffect, useRef, useState } from 'react';
import { ScanText } from 'lucide-react';
import { version as ocrVersion } from 'tesseract.js/package.json';
import * as content from './content.js';
import { cleanText, describeProgress, getFacts, getNote, scaleFor, textFilename } from './logic.js';
import BlobImage from '../../components/common/BlobImage.jsx';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import TextToolShell, { TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { saveBlob } from '../../utils/download.js';
import { drawToCanvas, openImage } from '../../utils/imageFile.js';

const OCR_FILES = `/ocr/${ocrVersion}`;
const stopButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center rounded-xl border-2 border-line bg-white px-4 text-sm font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';

export default function ImageToTextPage() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState();
  const worker = useRef(null);
  const latest = useRef(0);

  const stop = () => {
    latest.current += 1;
    worker.current?.terminate();
    worker.current = null;
    setProgress(null);
  };

  useEffect(
    () => () => {
      worker.current?.terminate();
    },
    [],
  );

  const read = async (chosen) => {
    stop();
    const request = latest.current;
    const isCurrent = () => request === latest.current;
    setResult(null);
    setError(undefined);
    setFile(null);
    try {
      const source = await openImage(chosen);
      if (!isCurrent()) return;
      setFile(chosen);
      setProgress({ label: 'Preparing', percent: 0 });
      const scale = scaleFor(source.width, source.height);
      const canvas = drawToCanvas(source.image, { width: Math.round(source.width * scale), height: Math.round(source.height * scale), background: '#ffffff' });
      const { createWorker } = await import('tesseract.js');
      if (!isCurrent()) return;
      const created = await createWorker('eng', 1, {
        workerPath: `${OCR_FILES}/worker.min.js`,
        corePath: OCR_FILES,
        langPath: OCR_FILES,
        workerBlobURL: false,
        logger: (message) => isCurrent() && setProgress(describeProgress(message)),
      });
      if (!isCurrent()) {
        created.terminate();
        return;
      }
      worker.current = created;
      const { data } = await created.recognize(canvas);
      if (!isCurrent()) return;
      created.terminate();
      worker.current = null;
      setProgress(null);
      setResult({ text: cleanText(data.text), confidence: data.confidence, name: chosen.name });
    } catch (failure) {
      if (!isCurrent()) return;
      worker.current?.terminate();
      worker.current = null;
      setProgress(null);
      setError(failure instanceof Error && !/network|fetch|load/i.test(failure.message) ? failure.message : 'The text reader could not be loaded. Check your connection and try again.');
    }
  };

  const clear = () => {
    stop();
    setFile(null);
    setResult(null);
    setError(undefined);
  };

  return (
    <ToolLayout toolId="image-to-text" content={content}>
      <TextToolShell
        formLabel="Choose an image"
        onClear={clear}
        panel={{ title: 'Extracted Text', icon: ScanText, emptyText: 'Choose a photo, scan or screenshot with printed English text.' }}
        results={
          (progress || result) && (
            <div className="mt-5">
              {progress && (
                <div role="status" className="rounded-xl bg-page px-4 py-4">
                  <div className="flex items-center justify-between text-sm font-bold">
                    <span>{progress.label}…</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-line" aria-hidden="true">
                    <div className="h-full bg-primary transition-[width]" style={{ width: `${progress.percent}%` }} />
                  </div>
                  <p className="mt-2 text-sm text-ink/80">The first time, about 4.5 MB of reader files are downloaded. Your image is not sent anywhere.</p>
                  <button type="button" onClick={stop} className={`${stopButton} mt-3`}>
                    Stop
                  </button>
                </div>
              )}
              {result &&
                (result.text ? (
                  <>
                    <FactList items={getFacts(result.text, result.confidence)} />
                    <p className="mt-3 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{getNote(result.confidence)}</p>
                    <TextOutput value={result.text} />
                    <div className="mt-4">
                      <DownloadButton onClick={() => saveBlob(new Blob([result.text], { type: 'text/plain' }), textFilename(result.name))}>Download .txt</DownloadButton>
                    </div>
                    <ResultActions copyOnly getText={() => result.text} />
                  </>
                ) : (
                  <p role="alert" className="rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">No text was found in this image. Try a sharper, closer image with printed English text.</p>
                ))}
            </div>
          )
        }
      >
        <FileDropZone id="ocr-file" label="Choose or drop an image" hint="JPG, PNG or WebP, up to 25 MB. It stays on your device." accept="image/*" onFile={read} error={error} />
        {file && (
          <div className="grid place-items-center rounded-2xl bg-page p-2">
            <BlobImage blob={file} alt="The chosen image" className="max-h-64 max-w-full object-contain" />
          </div>
        )}
      </TextToolShell>
    </ToolLayout>
  );
}
