import { useState } from 'react';
import { Coins, Landmark, Percent } from 'lucide-react';
import * as content from './content.js';
import { buildResultText, evaluate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import CopyButton from '../../components/common/CopyButton.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { formatInr } from '../../utils/currency.js';

const UNITS = [
  { id: 'years', name: 'Years' },
  { id: 'months', name: 'Months' },
];

function Schedule({ years }) {
  return (
    <div tabIndex={0} role="region" aria-label="Yearly schedule, scrollable" className="mt-4 overflow-x-auto rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-mint">
      <table className="w-full text-right text-sm">
        <caption className="mb-2 text-left font-bold">Yearly schedule</caption>
        <thead>
          <tr className="border-b border-line text-ink/80">
            <th scope="col" className="py-2 pr-3 text-left font-semibold">Year</th>
            <th scope="col" className="py-2 pr-3 font-semibold">Principal</th>
            <th scope="col" className="py-2 pr-3 font-semibold">Interest</th>
            <th scope="col" className="py-2 font-semibold">Balance</th>
          </tr>
        </thead>
        <tbody>
          {years.map(({ year, principal, interest, balance }) => (
            <tr key={year} className="border-b border-line last:border-0">
              <th scope="row" className="py-2 pr-3 text-left font-semibold">{year}</th>
              <td className="py-2 pr-3 whitespace-nowrap">{formatInr(principal)}</td>
              <td className="py-2 pr-3 whitespace-nowrap">{formatInr(interest)}</td>
              <td className="py-2 whitespace-nowrap">{formatInr(balance)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function EmiCalculatorPage() {
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const [tenure, setTenure] = useState('');
  const [unit, setUnit] = useState('years');
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate({ amount, rate, tenure, unit }) : { errors: {} };

  const reset = () => {
    setAmount('');
    setRate('');
    setTenure('');
    setUnit('years');
    form.clear();
  };

  return (
    <ToolLayout toolId="emi-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your loan details"
        note="This calculator provides estimates and is not financial advice. Confirm the exact terms with your lender."
        onReset={reset}
        panel={{ title: 'Your EMI', icon: Landmark, emptyText: 'Enter your loan details and select Calculate to see your EMI.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Monthly EMI" value={formatInr(result.emi)} icon={Landmark} />
                <ResultCard label="Total Interest" value={formatInr(result.totalInterest)} icon={Percent} tone="yellow" />
                <ResultCard label="Total Payment" value={formatInr(result.totalPayment)} icon={Coins} tone="lavender" />
              </div>
              <ResultDetails
                items={[
                  { label: 'Loan Amount', value: formatInr(result.principal) },
                  { label: 'Interest Rate', value: `${result.rate}% a year` },
                  { label: 'Tenure', value: `${result.months} months` },
                ]}
              />
              <Schedule years={result.years} />
              <CopyButton getText={() => buildResultText(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="emi-amount" label="Loan amount (₹)" value={amount} onChange={setAmount} error={errors.amount} />
        <CalculatorInput id="emi-rate" label="Interest rate (% a year)" suffix="%" value={rate} onChange={setRate} error={errors.rate} />
        <CalculatorInput id="emi-tenure" label={`Loan tenure (${unit})`} value={tenure} onChange={setTenure} error={errors.tenure} />
        <SegmentedControl label="Tenure unit" options={UNITS} value={unit} onChange={setUnit} />
      </CalculatorShell>
    </ToolLayout>
  );
}
