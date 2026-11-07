import { useState } from 'react';
import { Landmark } from 'lucide-react';
import * as content from './content.js';
import { breakdown, buildReport, buildResultText, convert, sum } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function RomanNumeralConverterPage() {
  const [text, setText] = useState('');
  const { error, result } = convert(text);
  const isRoman = result?.direction === 'to-roman';

  return (
    <ToolLayout toolId="roman-numeral-converter" content={content}>
      <TextToolShell
        formLabel="Enter a number or Roman numeral"
        onClear={() => setText('')}
        panel={{ title: 'Converted Value', icon: Landmark, emptyText: 'Type a number such as 2026, or a numeral such as MMXXVI.' }}
        results={
          result && (
            <>
              <div className="mt-5">
                <ResultCard label={isRoman ? `Roman numeral for ${result.number}` : `Value of ${result.roman}`} value={isRoman ? result.roman : result.number.toLocaleString('en-IN')} icon={Landmark} />
              </div>
              <ResultDetails
                items={[
                  { label: 'Parts', value: breakdown(result.parts) },
                  { label: 'Sum', value: sum(result.parts) },
                ]}
              />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="roman-value" label="Number or Roman numeral" inputMode="text" autoCapitalize="characters" spellCheck="false" value={text} onChange={setText} error={error} />
        <p className="text-sm text-ink/80">The direction is picked for you: digits become a numeral, and letters become a number.</p>
      </TextToolShell>
    </ToolLayout>
  );
}
