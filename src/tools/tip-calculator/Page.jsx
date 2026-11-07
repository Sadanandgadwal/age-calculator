import { useState } from 'react';
import { HandCoins, Receipt, Users } from 'lucide-react';
import * as content from './content.js';
import { PRESETS, buildReport, buildResultText, describeExtra, evaluate, getRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

const PRESET_OPTIONS = PRESETS.map((value) => ({ id: value, name: `${value}%` }));

export default function TipCalculatorPage() {
  const [bill, setBill] = useState('');
  const [percent, setPercent] = useState('10');
  const [people, setPeople] = useState('1');
  const [roundUp, setRoundUp] = useState(false);
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate({ bill, percent, people, roundUp }) : { errors: {} };
  const rows = result ? getRows(result) : [];
  const extra = result ? describeExtra(result) : null;

  const reset = () => {
    setBill('');
    setPercent('10');
    setPeople('1');
    setRoundUp(false);
    form.clear();
  };

  return (
    <ToolLayout toolId="tip-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your bill"
        onReset={reset}
        panel={{ title: 'Your Tip', icon: HandCoins, emptyText: 'Enter the bill and select Calculate to see the tip and each share.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={HandCoins} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Receipt} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={Users} tone="lavender" />
              </div>
              {extra && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{extra}</p>}
              <ResultDetails items={rows.slice(3)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="tip-bill" label="Bill amount (₹)" value={bill} onChange={setBill} error={errors.bill} />
        <SegmentedControl label="Common tip percentages" options={PRESET_OPTIONS} value={percent} onChange={setPercent} />
        <CalculatorInput id="tip-percent" label="Tip" suffix="%" value={percent} onChange={setPercent} error={errors.percent} />
        <CalculatorInput id="tip-people" label="Number of people" inputMode="numeric" value={people} onChange={setPeople} error={errors.people} />
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
          <input type="checkbox" checked={roundUp} onChange={(event) => setRoundUp(event.target.checked)} className="size-5 cursor-pointer accent-primary" />
          Round each share up to the nearest rupee
        </label>
      </CalculatorShell>
    </ToolLayout>
  );
}
