import { useState } from 'react';
import { Percent, ShoppingCart, TrendingDown } from 'lucide-react';
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

export default function InflationCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('6');
  const [years, setYears] = useState('');
  const form = useCalculatorForm();

  const mode = getMode(modeId);
  const { errors, result } = form.submitted ? evaluate(modeId, { amount, rate, years }) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setAmount('');
    setRate('6');
    setYears('');
    form.clear();
  };

  return (
    <ToolLayout toolId="inflation-calculator" content={content}>
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
        formLabel="Enter the amount and inflation"
        formTitle={mode.title}
        note="Uses the same inflation rate every year. Real prices rise at different rates for different things."
        onReset={reset}
        panel={{ title: 'Inflation Effect', icon: ShoppingCart, emptyText: 'Enter an amount, the inflation rate and the years, then select Calculate.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={ShoppingCart} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Percent} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={TrendingDown} tone="lavender" />
              </div>
              <ResultDetails items={rows.slice(3)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(mode, result)} />
            </>
          )
        }
      >
        <CalculatorInput id="inflation-amount" label={mode.labelA} value={amount} onChange={setAmount} error={errors.amount} />
        <CalculatorInput id="inflation-rate" label="Inflation (% a year)" suffix="%" value={rate} onChange={setRate} error={errors.rate} />
        <CalculatorInput id="inflation-years" label={mode.labelYears} value={years} onChange={setYears} error={errors.years} />
      </CalculatorShell>
    </ToolLayout>
  );
}
