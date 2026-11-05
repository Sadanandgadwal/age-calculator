import { useState } from 'react';
import { Barcode, Download } from 'lucide-react';
import * as content from './content.js';
import { FORMATS, buildReport, drawBarcode, evaluate, getFormat } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { saveBlob } from '../../utils/download.js';

const PNG_SCALE = 3;
const downloadButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-4 font-bold text-white transition-colors outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2';

function BarcodeImage({ svg, label }) {
  return <div role="img" aria-label={label} className="pr-barcode overflow-x-auto [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full" dangerouslySetInnerHTML={{ __html: svg }} />;
}

export default function BarcodeGeneratorPage() {
  const [value, setValue] = useState('');
  const [formatId, setFormatId] = useState(FORMATS[0].id);
  const { error, svg } = evaluate(value, formatId);
  const label = `${getFormat(formatId).name} barcode for ${value}`;

  const downloadSvg = () => saveBlob(new Blob([svg], { type: 'image/svg+xml' }), 'barcode.svg');

  const downloadPng = () => {
    const canvas = document.createElement('canvas');
    drawBarcode(canvas, value, formatId, PNG_SCALE);
    canvas.toBlob((blob) => blob && saveBlob(blob, 'barcode.png'), 'image/png');
  };

  return (
    <ToolLayout toolId="barcode-generator" content={content}>
      <TextToolShell
        formLabel="Enter your value"
        onClear={() => setValue('')}
        panel={{ title: 'Your Barcode', icon: Barcode, emptyText: 'Enter a value to create a barcode.' }}
        results={
          svg && (
            <>
              <div className="mt-5 rounded-xl bg-white p-2">
                <BarcodeImage svg={svg} label={label} />
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
              <ResultActions getText={() => value} getReport={() => buildReport(value, formatId, <BarcodeImage svg={svg} label={label} />)} />
            </>
          )
        }
      >
        <SegmentedControl label="Format" options={FORMATS} value={formatId} onChange={setFormatId} />
        <CalculatorInput id="barcode-value" inputMode="text" label="Value" value={value} onChange={setValue} error={error} />
        <p className="text-sm text-ink/80">{getFormat(formatId).hint}</p>
      </TextToolShell>
    </ToolLayout>
  );
}
