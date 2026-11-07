import { useState } from 'react';
import { ArrowUpDown, Binary } from 'lucide-react';
import * as content from './content.js';
import { BASES, buildReport, buildResultText, convert } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell, { TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { baseName } from '../../utils/numberBase.js';

const swapButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-line bg-white px-5 font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';
const selectClass =
  'mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint';

function BaseSelect({ id, label, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(Number(event.target.value))} className={selectClass}>
        {BASES.map(({ id: base, name }) => (
          <option key={base} value={base}>
            {name}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function NumberBaseConverterPage() {
  const [text, setText] = useState('');
  const [from, setFrom] = useState(10);
  const [to, setTo] = useState(2);
  const { error, result } = convert(text, from, to);

  const swap = () => {
    setFrom(to);
    setTo(from);
    if (result) setText(result.output);
  };

  return (
    <ToolLayout toolId="number-base-converter" content={content}>
      <TextToolShell
        formLabel="Enter a number to convert"
        onClear={() => setText('')}
        panel={{ title: 'Converted Number', icon: Binary, emptyText: 'Enter a number to convert it instantly.' }}
        results={
          result && (
            <>
              <TextOutput label={baseName(result.to)} value={result.output} className="font-mono text-base" />
              <ResultDetails items={result.common.map(({ label, value }) => ({ label, value: <span className="font-mono [overflow-wrap:anywhere]">{value}</span> }))} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="base-value" label="Number" inputMode="text" spellCheck="false" value={text} onChange={setText} error={error} />
        <BaseSelect id="base-from" label="From" value={from} onChange={setFrom} />
        <button type="button" onClick={swap} aria-label="Swap bases" className={swapButton}>
          <ArrowUpDown aria-hidden="true" className="size-5" />
          Swap
        </button>
        <BaseSelect id="base-to" label="To" value={to} onChange={setTo} />
      </TextToolShell>
    </ToolLayout>
  );
}
