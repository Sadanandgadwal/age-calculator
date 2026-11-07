import { useState } from 'react';
import { Palette } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, convert, getRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

const START = '#0B6657';

export default function ColorCodeConverterPage() {
  const [text, setText] = useState(START);
  const { error, result } = convert(text);

  return (
    <ToolLayout toolId="color-code-converter" content={content}>
      <TextToolShell
        formLabel="Enter a colour code"
        onClear={() => setText('')}
        panel={{ title: 'Colour Codes', icon: Palette, emptyText: 'Enter a colour code, or pick a colour, to convert it.' }}
        results={
          result && (
            <>
              <svg viewBox="0 0 200 60" role="img" aria-label={`Preview of ${result.hex} with white and black text`} className="mt-5 h-24 w-full overflow-hidden rounded-2xl border-2 border-line">
                <rect width="200" height="60" fill={result.hex} />
                <text x="50" y="38" textAnchor="middle" fontSize="20" fontWeight="800" fill="#ffffff">Aa</text>
                <text x="150" y="38" textAnchor="middle" fontSize="20" fontWeight="800" fill="#000000">Aa</text>
              </svg>
              <p className="mt-2 text-sm">
                {result.better === 'white' ? 'White' : 'Black'} text is easier to read on this colour.
              </p>
              <ResultDetails items={getRows(result)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result, text)} />
            </>
          )
        }
      >
        <CalculatorInput id="color-value" label="Colour code" inputMode="text" spellCheck="false" value={text} onChange={setText} error={error} />
        <div>
          <label htmlFor="color-picker" className="block text-sm font-bold text-ink">
            Or pick a colour
          </label>
          <input
            id="color-picker"
            type="color"
            value={result?.hex.toLowerCase() ?? '#000000'}
            onChange={(event) => setText(event.target.value.toUpperCase())}
            className="mt-2 block h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white p-1 outline-none hover:border-mint focus-visible:ring-3 focus-visible:ring-mint"
          />
        </div>
      </TextToolShell>
    </ToolLayout>
  );
}
