import { useMemo, useState } from 'react';
import { CircleAlert, ImageDown } from 'lucide-react';
import * as content from './content.js';
import { getFacts, parseImageText } from './logic.js';
import BlobImage from '../../components/common/BlobImage.jsx';
import DownloadButton from '../../components/common/DownloadButton.jsx';
import FactList from '../../components/common/FactList.jsx';
import { CHECKERBOARD } from '../../components/common/imagePreview.js';
import TextToolShell, { TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { saveBlob } from '../../utils/download.js';

export default function Base64ToImagePage() {
  const [text, setText] = useState('');
  const [status, setStatus] = useState({ blob: null, size: null, failed: false });

  const parsed = useMemo(() => (text.trim() ? parseImageText(text) : null), [text]);
  const blob = useMemo(() => (parsed?.bytes ? new Blob([parsed.bytes], { type: parsed.type }) : null), [parsed]);
  const current = status.blob === blob ? status : { size: null, failed: false };
  const fieldError = parsed?.error ?? (current.failed ? 'This looks like an image, but it is damaged and could not be opened.' : undefined);

  return (
    <ToolLayout toolId="base64-to-image" content={content}>
      <TextToolShell
        formLabel="Paste Base64 text"
        onClear={() => setText('')}
        panel={{ title: 'Your Image', icon: ImageDown, emptyText: 'Paste Base64 text or a data URI to see the image.' }}
        results={
          blob &&
          !current.failed && (
            <div className="mt-5">
              <div style={CHECKERBOARD} className="grid place-items-center overflow-hidden rounded-2xl p-2">
                <BlobImage
                  blob={blob}
                  alt="The decoded image"
                  className="max-h-96 max-w-full object-contain"
                  onLoad={(event) => setStatus({ blob, size: { width: event.target.naturalWidth, height: event.target.naturalHeight }, failed: false })}
                  onError={() => setStatus({ blob, size: null, failed: true })}
                />
              </div>
              {current.size && (
                <>
                  <FactList items={getFacts(parsed, current.size)} />
                  {parsed.declaredMismatch && (
                    <p className="mt-3 flex items-start gap-2 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">
                      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                      The data URI names a different image type. This was detected from the data itself.
                    </p>
                  )}
                  <div className="mt-4">
                    <DownloadButton onClick={() => saveBlob(blob, `image.${parsed.extension}`)} />
                  </div>
                </>
              )}
            </div>
          )
        }
      >
        <TextField id="base64-input" label="Base64 text or data URI" value={text} onChange={setText} error={fieldError} rows={10} className="font-mono" placeholder="data:image/png;base64,iVBORw0KGgo…" />
      </TextToolShell>
    </ToolLayout>
  );
}
