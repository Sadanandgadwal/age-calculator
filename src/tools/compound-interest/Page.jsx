import { useState } from 'react';
import { Coins, Percent, TrendingUp } from 'lucide-react';
import * as content from './content.js';
import { FREQUENCIES, SCHEDULE_COLUMNS, buildReport, buildResultText, evaluate, getRows, scheduleRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ScheduleTable from '../../components/common/ScheduleTable.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

export default function CompoundInterestCalculatorPage() {
  const [principal, setPrincipal] = useState('');
  const [rate, setRate] = useState('');
  const [years, setYears] = useState('');
  const [frequency, setFrequency] = useState('4');
  const [deposit, setDeposit] = useState('');
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate({ principal, rate, years, frequency, deposit }) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setPrincipal('');
    setRate('');
    setYears('');
    setFrequency('4');
    setDeposit('');
    form.clear();
  };

  return (
    <ToolLayout toolId="compound-interest-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your investment"
        note="This calculator provides estimates and is not financial advice. Real returns can vary, and tax is not included."
        onReset={reset}
        panel={{ title: 'Your Growth', icon: TrendingUp, emptyText: 'Enter your amount, rate and time, then select Calculate.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={TrendingUp} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Percent} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={Coins} tone="lavender" />
              </div>
              <ResultDetails items={rows.slice(3)} />
              <ScheduleTable caption="Yearly growth" columns={SCHEDULE_COLUMNS} rows={scheduleRows(result.years)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="ci-principal" label="Starting amount (₹)" value={principal} onChange={setPrincipal} error={errors.principal} />
        <CalculatorInput id="ci-rate" label="Interest rate (% a year)" suffix="%" value={rate} onChange={setRate} error={errors.rate} />
        <CalculatorInput id="ci-years" label="Time (years)" value={years} onChange={setYears} error={errors.years} />
        <div>
          <label htmlFor="ci-frequency" className="block text-sm font-bold text-ink">
            Compounding
          </label>
          <select
            id="ci-frequency"
            value={frequency}
            onChange={(event) => setFrequency(event.target.value)}
            className="mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint"
          >
            {FREQUENCIES.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <CalculatorInput id="ci-deposit" label="Monthly deposit (₹, optional)" value={deposit} onChange={setDeposit} error={errors.deposit} />
      </CalculatorShell>
    </ToolLayout>
  );
}
