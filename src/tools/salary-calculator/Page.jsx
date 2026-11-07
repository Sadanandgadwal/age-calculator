import { useState } from 'react';
import { CalendarDays, Clock, Wallet } from 'lucide-react';
import * as content from './content.js';
import { PERIODS, buildReport, buildResultText, evaluate, getRows, tableColumns, tableRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ScheduleTable from '../../components/common/ScheduleTable.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

export default function SalaryCalculatorPage() {
  const [amount, setAmount] = useState('');
  const [period, setPeriod] = useState('month');
  const [hours, setHours] = useState('40');
  const [days, setDays] = useState('5');
  const [raise, setRaise] = useState('');
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate({ amount, period, hours, days, raise }) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setAmount('');
    setPeriod('month');
    setHours('40');
    setDays('5');
    setRaise('');
    form.clear();
  };

  return (
    <ToolLayout toolId="salary-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your pay"
        note="Based on 52 working weeks a year and pay before tax and deductions."
        onReset={reset}
        panel={{ title: 'Your Pay', icon: Wallet, emptyText: 'Enter your pay and select Calculate to see it for every period.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={Wallet} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={CalendarDays} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={Clock} tone="lavender" />
              </div>
              <ScheduleTable caption="Pay for each period" columns={tableColumns(result)} rows={tableRows(result)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="salary-amount" label="Pay (₹)" value={amount} onChange={setAmount} error={errors.amount} />
        <SegmentedControl label="Pay period" options={PERIODS} value={period} onChange={setPeriod} />
        <CalculatorInput id="salary-hours" label="Hours worked a week" value={hours} onChange={setHours} error={errors.hours} />
        <CalculatorInput id="salary-days" label="Days worked a week" value={days} onChange={setDays} error={errors.days} />
        <CalculatorInput id="salary-raise" label="Pay rise or cut (optional)" suffix="%" value={raise} onChange={setRaise} error={errors.raise} />
      </CalculatorShell>
    </ToolLayout>
  );
}
