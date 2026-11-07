import { useState } from 'react';
import { Divide, Hash, Layers } from 'lucide-react';
import * as content from './content.js';
import { MODES, OPERATIONS, buildReport, buildResultText, evaluate, getRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

export default function FractionCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [operation, setOperation] = useState('add');
  const form = useCalculatorForm();

  const mode = MODES.find((item) => item.id === modeId);
  const values = { a, b, operation };
  const { errors, result } = form.submitted ? evaluate(modeId, values) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setA('');
    setB('');
    setOperation('add');
    form.clear();
  };

  const firstLabel = { calculate: 'First fraction', simplify: 'Fraction', decimal: 'Decimal' }[modeId];

  return (
    <ToolLayout toolId="fraction-calculator" content={content}>
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
        formLabel="Enter your fractions"
        formTitle={mode.title}
        note="Type fractions as 3/4, mixed numbers as 1 1/2, and negatives with a minus sign, such as -2/3."
        onReset={reset}
        panel={{ title: 'Your Answer', icon: Divide, emptyText: 'Enter your fractions and select Calculate to see the answer.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={Divide} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Layers} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={Hash} tone="lavender" />
              </div>
              <ResultDetails items={rows.slice(3)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(mode, values, result)} />
            </>
          )
        }
      >
        <CalculatorInput id="fraction-a" label={firstLabel} inputMode="text" value={a} onChange={setA} error={errors.a} placeholder={modeId === 'decimal' ? 'For example: 0.375' : 'For example: 3/4'} />
        {modeId === 'calculate' && (
          <>
            <SegmentedControl label="Operation" options={OPERATIONS} value={operation} onChange={setOperation} />
            <CalculatorInput id="fraction-b" label="Second fraction" inputMode="text" value={b} onChange={setB} error={errors.b} placeholder="For example: 1 1/2" />
          </>
        )}
      </CalculatorShell>
    </ToolLayout>
  );
}
