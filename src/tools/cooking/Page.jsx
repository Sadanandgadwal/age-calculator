import { useState } from 'react';
import { ArrowUpDown, CookingPot } from 'lucide-react';
import * as content from './content.js';
import { INGREDIENTS, NOTE, UNITS, buildReport, buildResultText, convert, formatAmount, getUnit } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

const selectClass =
  'mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint';
const swapButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-line bg-white px-5 font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';

function Select({ id, label, value, onChange, children }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>
        {children}
      </select>
    </div>
  );
}

const unitOptions = ['volume', 'weight'].map((kind) => (
  <optgroup key={kind} label={kind === 'volume' ? 'Volume' : 'Weight'}>
    {UNITS.filter((unit) => unit.kind === kind).map(({ id, name }) => (
      <option key={id} value={id}>
        {name}
      </option>
    ))}
  </optgroup>
));

export default function CookingConverterPage() {
  const [text, setText] = useState('');
  const [fromId, setFromId] = useState('cup');
  const [toId, setToId] = useState('g');
  const [ingredientId, setIngredientId] = useState('flour');
  const { error, result } = convert(text, fromId, toId, ingredientId);
  const needsIngredient = getUnit(fromId).kind !== getUnit(toId).kind;

  const reset = () => {
    setText('');
    setFromId('cup');
    setToId('g');
    setIngredientId('flour');
  };

  return (
    <ToolLayout toolId="cooking-converter" content={content}>
      <TextToolShell
        formLabel="Enter an amount to convert"
        onClear={reset}
        panel={{ title: 'Converted Amount', icon: CookingPot, emptyText: 'Enter an amount to convert it instantly.' }}
        results={
          result && (
            <>
              <div className="mt-5">
                <ResultCard label={result.to.name} value={formatAmount(result.output)} icon={CookingPot} />
              </div>
              <ResultDetails items={[{ label: 'Result', value: result.summary }, ...(result.oneCup ? [{ label: 'Reference', value: result.oneCup }] : [])]} />
              {result.ingredient && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{NOTE}</p>}
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="cook-value" label="Amount" value={text} onChange={setText} error={error} />
        <Select id="cook-from" label="From" value={fromId} onChange={setFromId}>
          {unitOptions}
        </Select>
        <button
          type="button"
          aria-label="Swap units"
          className={swapButton}
          onClick={() => {
            setFromId(toId);
            setToId(fromId);
          }}
        >
          <ArrowUpDown aria-hidden="true" className="size-5" />
          Swap
        </button>
        <Select id="cook-to" label="To" value={toId} onChange={setToId}>
          {unitOptions}
        </Select>
        <Select id="cook-ingredient" label="Ingredient" value={ingredientId} onChange={setIngredientId}>
          {INGREDIENTS.map(({ id, name }) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
        </Select>
        <p className="text-sm text-ink/80">{needsIngredient ? 'The ingredient matters when turning cups and spoons into weight.' : 'The ingredient does not change volume-to-volume or weight-to-weight conversions.'}</p>
      </TextToolShell>
    </ToolLayout>
  );
}
