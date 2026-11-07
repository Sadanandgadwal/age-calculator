import { useState } from 'react';
import { ChartLine, Coins, TrendingUp } from 'lucide-react';
import * as content from './content.js';
import { SCHEDULE_COLUMNS, buildReport, buildResultText, evaluate, getRows, scheduleRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ScheduleTable from '../../components/common/ScheduleTable.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

export default function SipCalculatorPage() {
  const [monthly, setMonthly] = useState('');
  const [rate, setRate] = useState('12');
  const [years, setYears] = useState('');
  const [stepUp, setStepUp] = useState('');
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate({ monthly, rate, years, stepUp }) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setMonthly('');
    setRate('12');
    setYears('');
    setStepUp('');
    form.clear();
  };

  return (
    <ToolLayout toolId="sip-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your SIP"
        note="Mutual fund returns are not guaranteed. This is an estimate, not financial advice."
        onReset={reset}
        panel={{ title: 'Your SIP Growth', icon: ChartLine, emptyText: 'Enter your monthly SIP and select Calculate to see how it could grow.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={TrendingUp} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Coins} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={ChartLine} tone="lavender" />
              </div>
              <ResultDetails items={rows.slice(3)} />
              <ScheduleTable caption="Yearly growth" columns={SCHEDULE_COLUMNS} rows={scheduleRows(result.years)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="sip-monthly" label="Monthly investment (₹)" value={monthly} onChange={setMonthly} error={errors.monthly} />
        <CalculatorInput id="sip-rate" label="Expected return (% a year)" suffix="%" value={rate} onChange={setRate} error={errors.rate} />
        <CalculatorInput id="sip-years" label="Time (years)" inputMode="numeric" value={years} onChange={setYears} error={errors.years} />
        <CalculatorInput id="sip-step" label="Yearly increase in SIP (optional)" suffix="%" value={stepUp} onChange={setStepUp} error={errors.stepUp} />
      </CalculatorShell>
    </ToolLayout>
  );
}
