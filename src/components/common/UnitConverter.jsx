import { useState } from 'react';
import { ArrowLeftRight, ArrowUpDown, RotateCcw, X } from 'lucide-react';
import CalculatorInput from './CalculatorInput.jsx';
import ResultActions from './ResultActions.jsx';
import ResultCard from './ResultCard.jsx';
import ResultDetails from './ResultDetails.jsx';
import ResultPanel from './ResultPanel.jsx';
import { buildConversionText, evaluateConversion } from '../../utils/unitConversion.js';

const actionButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-line bg-white px-5 font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2';

function UnitSelect({ id, label, value, units, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint"
      >
        {units.map(({ id: unitId, name, symbol }) => (
          <option key={unitId} value={unitId}>
            {name} ({symbol})
          </option>
        ))}
      </select>
    </div>
  );
}

export default function UnitConverter({ units, defaultFrom, defaultTo, getExtraDetails, evaluate = evaluateConversion, resetsUnits = false }) {
  const [text, setText] = useState('');
  const [fromId, setFromId] = useState(defaultFrom);
  const [toId, setToId] = useState(defaultTo);
  const { error, result } = evaluate(text, fromId, toId, units);

  const swap = () => {
    setFromId(toId);
    setToId(fromId);
  };

  const reset = () => {
    setText('');
    if (resetsUnits) {
      setFromId(defaultFrom);
      setToId(defaultTo);
    }
  };

  const extraDetails = result && getExtraDetails ? getExtraDetails(result) : [];

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section aria-label="Enter a value to convert" className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
        <form onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
          <CalculatorInput id="convert-value" label="Value" value={text} onChange={setText} error={error} />
          <UnitSelect id="convert-from" label="From" value={fromId} units={units} onChange={setFromId} />
          <button type="button" onClick={swap} aria-label="Swap units" className={actionButton}>
            <ArrowUpDown aria-hidden="true" className="size-5" />
            Swap
          </button>
          <UnitSelect id="convert-to" label="To" value={toId} units={units} onChange={setToId} />
          <button type="button" onClick={reset} className={actionButton}>
            {resetsUnits ? <RotateCcw aria-hidden="true" className="size-5" /> : <X aria-hidden="true" className="size-5" />}
            {resetsUnits ? 'Reset' : 'Clear'}
          </button>
        </form>
      </section>

      <ResultPanel title="Conversion Result" icon={ArrowLeftRight} emptyText="Enter a value to convert it instantly.">
        {result && (
          <>
            <p aria-live="polite" className="sr-only">
              {result.summary}
            </p>
            <div className="mt-5">
              <ResultCard label={result.to.name} value={result.outputText} />
            </div>
            <ResultDetails
              items={[
                { label: 'Result', value: result.summary },
                { label: 'Formula', value: result.formula },
                ...(result.unitRate ? [{ label: 'Conversion Rate', value: result.unitRate }] : []),
                ...extraDetails,
              ]}
            />
            <ResultActions getText={() => buildConversionText(result, extraDetails)} />
          </>
        )}
      </ResultPanel>
    </div>
  );
}
