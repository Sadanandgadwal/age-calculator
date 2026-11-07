import { useState } from 'react';
import { Equal, PieChart, Split } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, buildResultText, evaluate, getMode, getRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

const EMPTY = { a: '', b: '', c: '' };
const ICONS = [Equal, Split, PieChart];
const TONES = ['mint', 'yellow', 'lavender'];

export default function RatioCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [values, setValues] = useState(EMPTY);
  const form = useCalculatorForm();

  const mode = getMode(modeId);
  const { errors, result } = form.submitted ? evaluate(modeId, values) : { errors: {} };
  const rows = result ? getRows(result) : [];
  const cardCount = result?.modeId === 'share' ? 2 : 1;

  const reset = () => {
    setValues(EMPTY);
    form.clear();
  };

  return (
    <ToolLayout toolId="ratio-calculator" content={content}>
      <div className="mb-6">
        <SegmentedControl
          label="Calculation mode"
          options={MODES}
          value={modeId}
          onChange={(id) => {
            setModeId(id);
            reset();
          }}
        />
      </div>

      <CalculatorShell
        form={form}
        formLabel="Enter your ratio"
        formTitle={mode.title}
        onReset={reset}
        panel={{ title: 'Your Ratio', icon: Equal, emptyText: 'Enter your numbers and select Calculate to see the ratio.' }}
        results={
          result && (
            <>
              <div className={`mt-5 grid gap-2 sm:gap-3 ${cardCount === 2 ? 'sm:grid-cols-2' : ''}`}>
                {rows.slice(0, cardCount).map(({ label, value }, index) => (
                  <ResultCard key={label} label={label} value={value} icon={ICONS[index]} tone={TONES[index]} />
                ))}
              </div>
              <ResultDetails items={rows.slice(cardCount)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(mode, values, result)} />
            </>
          )
        }
      >
        {Object.entries(mode.labels).map(([key, label]) => (
          <CalculatorInput key={`${modeId}-${key}`} id={`ratio-${key}`} label={label} value={values[key]} onChange={(next) => setValues((current) => ({ ...current, [key]: next }))} error={errors[key]} />
        ))}
      </CalculatorShell>
    </ToolLayout>
  );
}
