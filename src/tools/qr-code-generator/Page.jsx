import { useState } from 'react';
import { Download, QrCode } from 'lucide-react';
import * as content from './content.js';
import { LEVELS, buildReport, buildSvg, drawToCanvas, evaluate, getModulePath, getViewSize } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

const downloadButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-4 font-bold text-white transition-colors outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2';

function saveBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function QrImage({ matrix, label }) {
  const size = getViewSize(matrix);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges" className="mx-auto block w-full max-w-72 rounded-xl">
      <path fill="#fff" d={`M0 0h${size}v${size}H0z`} />
      <path fill="#000" d={getModulePath(matrix)} />
    </svg>
  );
}

export default function QrCodeGeneratorPage() {
  const [text, setText] = useState('');
  const [level, setLevel] = useState('M');
  const { error, matrix } = evaluate(text, level);

  const downloadSvg = () => saveBlob(new Blob([buildSvg(matrix)], { type: 'image/svg+xml' }), 'qr-code.svg');

  const downloadPng = () => {
    const canvas = document.createElement('canvas');
    drawToCanvas(canvas, matrix);
    canvas.toBlob((blob) => blob && saveBlob(blob, 'qr-code.png'), 'image/png');
  };

  return (
    <ToolLayout toolId="qr-code-generator" content={content}>
      <TextToolShell
        formLabel="Enter your text or link"
        onClear={() => setText('')}
        panel={{ title: 'Your QR Code', icon: QrCode, emptyText: 'Type your text or link to create a QR code.' }}
        results={
          matrix && (
            <>
              <div className="mt-5">
                <QrImage matrix={matrix} label={`QR code for ${text}`} />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 print:hidden">
                <button type="button" onClick={downloadPng} className={downloadButton}>
                  <Download aria-hidden="true" className="size-5" />
                  Download PNG
                </button>
                <button type="button" onClick={downloadSvg} className={downloadButton}>
                  <Download aria-hidden="true" className="size-5" />
                  Download SVG
                </button>
              </div>
              <ResultActions getText={() => text} getReport={() => buildReport(text, level, matrix, <QrImage matrix={matrix} label={`QR code for ${text}`} />)} />
            </>
          )
        }
      >
        <TextField id="qr-text" label="Text or link" rows={5} value={text} onChange={setText} error={error} />
        <SegmentedControl label="Error correction" options={LEVELS} value={level} onChange={setLevel} />
      </TextToolShell>
    </ToolLayout>
  );
}
