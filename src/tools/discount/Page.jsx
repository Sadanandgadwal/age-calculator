import { useState } from 'react';
import { Percent, PiggyBank, Tag } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildResultText, evaluate, formatPercent, getMode } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { formatInr } from '../../utils/currency.js';

export default function DiscountCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const form = useCalculatorForm();

  const mode = getMode(modeId);
  const { errors, result } = form.submitted ? evaluate(modeId, a, b) : { errors: {} };

  const reset = () => {
    setA('');
    setB('');
    form.clear();
  };

  return (
    <ToolLayout toolId="discount-calculator" content={content}>
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
        formLabel="Enter your prices"
        formTitle={mode.title}
        onReset={reset}
        panel={{ title: 'Your Savings', icon: Tag, emptyText: 'Enter your values and select Calculate to see your savings.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Final Price" value={formatInr(result.sale)} icon={Tag} />
                <ResultCard label="You Save" value={formatInr(result.saved)} icon={PiggyBank} tone="yellow" />
                <ResultCard label="Discount" value={formatPercent(result.percent)} icon={Percent} tone="lavender" />
              </div>
              <ResultDetails
                items={[
                  { label: 'Original Price', value: formatInr(result.original) },
                  { label: 'Formula', value: result.formula },
                ]}
              />
              <ResultActions getText={() => buildResultText(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="discount-a" label={mode.labelA} value={a} onChange={setA} error={errors.a} />
        <CalculatorInput id="discount-b" label={mode.labelB} suffix={mode.suffixB} value={b} onChange={setB} error={errors.b} />
      </CalculatorShell>
    </ToolLayout>
  );
}
