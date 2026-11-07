import { useState } from 'react';
import { Banknote, CalendarCheck, PiggyBank, Timer } from 'lucide-react';
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

export default function LoanPayoffCalculatorPage() {
  const [balance, setBalance] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [extra, setExtra] = useState('');
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate({ balance, rate, tenure, extra }) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setBalance('');
    setRate('');
    setTenure('');
    setExtra('');
    form.clear();
  };

  return (
    <ToolLayout toolId="loan-payoff-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your loan details"
        note="This calculator provides estimates and is not financial advice. Check prepayment charges and terms with your lender."
        onReset={reset}
        panel={{ title: 'Your Savings', icon: Banknote, emptyText: 'Enter your loan and extra payment, then select Calculate to see what you save.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={PiggyBank} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Timer} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={CalendarCheck} tone="lavender" />
              </div>
              <ResultDetails items={rows.slice(3)} />
              <ScheduleTable caption="Yearly schedule with extra payments" columns={SCHEDULE_COLUMNS} rows={scheduleRows(result.after.years)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="payoff-balance" label="Loan balance (₹)" value={balance} onChange={setBalance} error={errors.balance} />
        <CalculatorInput id="payoff-rate" label="Interest rate (% a year)" suffix="%" value={rate} onChange={setRate} error={errors.rate} />
        <CalculatorInput id="payoff-tenure" label="Remaining tenure (years)" value={tenure} onChange={setTenure} error={errors.tenure} />
        <CalculatorInput id="payoff-extra" label="Extra payment each month (₹)" value={extra} onChange={setExtra} error={errors.extra} />
      </CalculatorShell>
    </ToolLayout>
  );
}
