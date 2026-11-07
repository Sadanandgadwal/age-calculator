import { useState } from 'react';
import { Coins, PiggyBank, TrendingUp } from 'lucide-react';
import * as content from './content.js';
import { MODES, SCHEDULE_COLUMNS, buildReport, buildResultText, describeReached, evaluate, getRows, scheduleRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ScheduleTable from '../../components/common/ScheduleTable.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

const EMPTY = { goal: '', current: '', rate: '', years: '', monthly: '' };

export default function SavingsGoalCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [values, setValues] = useState(EMPTY);
  const form = useCalculatorForm();

  const mode = MODES.find((item) => item.id === modeId);
  const { errors, result } = form.submitted ? evaluate(modeId, values) : { errors: {} };
  const rows = result ? getRows(result) : [];
  const reached = result ? describeReached(result) : null;
  const field = (key) => ({ value: values[key], onChange: (next) => setValues((current) => ({ ...current, [key]: next })), error: errors[key] });

  const reset = () => {
    setValues(EMPTY);
    form.clear();
  };

  return (
    <ToolLayout toolId="savings-goal-calculator" content={content}>
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
        formLabel="Enter your goal"
        formTitle={mode.title}
        note="This calculator provides estimates and is not financial advice. Returns are not guaranteed, and tax is not included."
        onReset={reset}
        panel={{ title: 'Your Savings Plan', icon: PiggyBank, emptyText: 'Enter your goal and select Calculate to see your plan.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={PiggyBank} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={TrendingUp} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={Coins} tone="lavender" />
              </div>
              {reached && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{reached}</p>}
              <ResultDetails items={rows.slice(3)} />
              {result.years.length > 0 && <ScheduleTable caption="Yearly progress" columns={SCHEDULE_COLUMNS} rows={scheduleRows(result.years)} />}
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(mode, result)} />
            </>
          )
        }
      >
        <CalculatorInput key={`${modeId}-goal`} id="savings-goal" label="Goal amount (₹)" {...field('goal')} />
        <CalculatorInput key={`${modeId}-current`} id="savings-current" label="Current savings (₹, optional)" {...field('current')} />
        <CalculatorInput key={`${modeId}-rate`} id="savings-rate" label="Expected return (% a year)" suffix="%" {...field('rate')} />
        {modeId === 'monthly' ? (
          <CalculatorInput key="years" id="savings-years" label="Time (years)" {...field('years')} />
        ) : (
          <CalculatorInput key="monthly" id="savings-monthly" label="Monthly saving (₹)" {...field('monthly')} />
        )}
      </CalculatorShell>
    </ToolLayout>
  );
}
