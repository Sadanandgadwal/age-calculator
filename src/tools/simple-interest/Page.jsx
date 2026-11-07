import { useState } from 'react';
import { BadgePercent, Coins } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, buildResultText, evaluate, fieldInfo, getMode, getRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

const EMPTY = { principal: '', interest: '', rate: '', time: '' };

export default function SimpleInterestCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [values, setValues] = useState(EMPTY);
  const form = useCalculatorForm();

  const mode = getMode(modeId);
  const { errors, result } = form.submitted ? evaluate(modeId, values) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setValues(EMPTY);
    form.clear();
  };

  return (
    <ToolLayout toolId="simple-interest-calculator" content={content}>
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
        formLabel="Enter your values"
        formTitle={mode.title}
        onReset={reset}
        panel={{ title: 'Your Interest', icon: BadgePercent, emptyText: 'Enter your values and select Calculate to see the result.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 sm:gap-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={BadgePercent} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Coins} tone="yellow" />
              </div>
              <ResultDetails items={rows.slice(2)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(mode, values, result)} />
            </>
          )
        }
      >
        {mode.inputs.map((key) => {
          const { label, suffix } = fieldInfo(key);
          return (
            <CalculatorInput key={`${modeId}-${key}`} id={`si-${key}`} label={label} suffix={suffix} value={values[key]} onChange={(next) => setValues((current) => ({ ...current, [key]: next }))} error={errors[key]} />
          );
        })}
      </CalculatorShell>
    </ToolLayout>
  );
}
