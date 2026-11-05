import { saveBlob } from '../../utils/download.js';
import BlobImage from './BlobImage.jsx';
import DownloadButton from './DownloadButton.jsx';
import FactList from './FactList.jsx';
import { CHECKERBOARD } from './imagePreview.js';

export default function ImageResult({ blob, filename, alt, facts, note, downloadLabel = 'Download image' }) {
  return (
    <div className="mt-5">
      <div style={CHECKERBOARD} className="grid place-items-center overflow-hidden rounded-2xl p-2">
        <BlobImage blob={blob} alt={alt} className="max-h-96 max-w-full object-contain" />
      </div>
      <FactList items={facts} />
      {note && <p className="mt-3 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{note}</p>}
      <div className="mt-4">
        <DownloadButton onClick={() => saveBlob(blob, filename)}>{downloadLabel}</DownloadButton>
      </div>
    </div>
  );
}
