import { useState } from 'react';
import { FileImage } from 'lucide-react';
import * as content from './content.js';
import { FORMATS, MAX_BYTES, altFromName, formatOutput, getFacts, previewOutput } from './logic.js';
import BlobImage from '../../components/common/BlobImage.jsx';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import FileDropZone from '../../components/common/FileDropZone.jsx';
import { CHECKERBOARD } from '../../components/common/imagePreview.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import useImageFile from '../../hooks/useImageFile.js';
import { saveBlob } from '../../utils/download.js';

function readDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('This image could not be read. Please try another one.'));
    reader.readAsDataURL(file);
  });
}

export default function ImageToBase64Page() {
  const { source, error, choose, clear } = useImageFile(MAX_BYTES);
  const [encoded, setEncoded] = useState(null);
  const [readError, setReadError] = useState();
  const [formatId, setFormatId] = useState(FORMATS[0].id);

  const handleFile = async (file) => {
    setEncoded(null);
    setReadError(undefined);
    choose(file);
    try {
      const dataUrl = await readDataUrl(file);
      setEncoded({ file, dataUrl });
    } catch (failure) {
      setReadError(failure.message);
    }
  };

  const reset = () => {
    clear();
    setEncoded(null);
    setReadError(undefined);
  };

  const dataUrl = source && encoded?.file === source.file ? encoded.dataUrl : null;
  const output = dataUrl && formatOutput(dataUrl, formatId, altFromName(source.name));
  const preview = output && previewOutput(output);

  return (
    <ToolLayout toolId="image-to-base64" content={content}>
      <TextToolShell
        formLabel="Choose an image"
        onClear={reset}
        panel={{ title: 'Base64 Output', icon: FileImage, emptyText: 'Choose an image to see its Base64 text.' }}
        results={
          output && (
            <>
              <div style={CHECKERBOARD} className="mt-5 grid place-items-center overflow-hidden rounded-2xl p-2">
                <BlobImage blob={source.file} alt={`Preview of ${source.name}`} className="max-h-48 max-w-full object-contain" />
              </div>
              <FactList items={getFacts(source, dataUrl)} />
              <TextOutput value={preview.text} className="font-mono" />
              {preview.isPartial && <p className="mt-2 text-sm font-medium text-ink/80">This is too long to show in full. Copy or download it to get all of it.</p>}
              <div className="mt-4">
                <DownloadButton onClick={() => saveBlob(new Blob([output], { type: 'text/plain' }), `${altFromName(source.name) || 'image'}-base64.txt`)}>Download .txt</DownloadButton>
              </div>
              <ResultActions copyOnly getText={() => output} />
            </>
          )
        }
      >
        <FileDropZone id="base64-file" label="Choose or drop an image" hint="PNG, JPG, WebP, GIF or SVG, up to 10 MB. It stays on your device." accept="image/*" onFile={handleFile} error={error ?? readError} />
        <SegmentedControl label="Output format" options={FORMATS} value={formatId} onChange={setFormatId} />
      </TextToolShell>
    </ToolLayout>
  );
}
