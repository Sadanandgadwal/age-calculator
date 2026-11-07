import { useState } from 'react';
import { ArrowDownUp, Sigma, Weight } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, buildResultText, evaluate, getRows } from './logic.js';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import { TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

export default function AverageCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [numbers, setNumbers] = useState('');
  const [weights, setWeights] = useState('');
  const form = useCalculatorForm();

  const mode = MODES.find((item) => item.id === modeId);
  const { errors, result } = form.submitted ? evaluate(modeId, numbers, weights) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setNumbers('');
    setWeights('');
    form.clear();
  };

  return (
    <ToolLayout toolId="average-calculator" content={content}>
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
        formLabel="Enter your numbers"
        formTitle={mode.title}
        onReset={reset}
        panel={{ title: 'Your Average', icon: Sigma, emptyText: 'Enter your numbers and select Calculate to see the average.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={Sigma} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={result.modeId === 'weighted' ? Sigma : ArrowDownUp} tone="yellow" />
                <ResultCard label={rows.at(-1).label} value={rows.at(-1).value} icon={Weight} tone="lavender" />
              </div>
              <ResultDetails items={rows.slice(2, -1)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(mode, numbers, weights, result)} />
            </>
          )
        }
      >
        <TextField id="average-numbers" label="Numbers" rows={4} value={numbers} onChange={setNumbers} error={errors.numbers} placeholder="For example: 12, 15, 9, 20" inputMode="decimal" />
        {modeId === 'weighted' && (
          <TextField id="average-weights" label="Weights, in the same order" rows={3} value={weights} onChange={setWeights} error={errors.weights} placeholder="For example: 2, 1, 1, 3" inputMode="decimal" />
        )}
      </CalculatorShell>
    </ToolLayout>
  );
}
