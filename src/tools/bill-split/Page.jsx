import { useState } from 'react';
import { ReceiptText, UserRound, Users } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, describeShares, evaluate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { formatInr } from '../../utils/currency.js';

export default function BillSplitPage() {
  const [bill, setBill] = useState('');
  const [people, setPeople] = useState('');
  const [tax, setTax] = useState('');
  const [tip, setTip] = useState('');
  const [roundUp, setRoundUp] = useState(false);
  const form = useCalculatorForm();

  const { errors, result } = form.submitted ? evaluate({ bill, people, tax, tip, roundUp }) : { errors: {} };
  const shareNote = result && describeShares(result);

  const reset = () => {
    setBill('');
    setPeople('');
    setTax('');
    setTip('');
    setRoundUp(false);
    form.clear();
  };

  return (
    <ToolLayout toolId="bill-split-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your bill details"
        onReset={reset}
        panel={{ title: 'Your Split', icon: Users, emptyText: 'Enter the bill and number of people, then select Calculate to see each share.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Each Person Pays" value={formatInr(result.share)} icon={UserRound} />
                <ResultCard label="Total Bill" value={formatInr(result.total)} icon={ReceiptText} tone="yellow" />
                <ResultCard label="People" value={result.people} icon={Users} tone="lavender" />
              </div>
              {shareNote && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{shareNote}</p>}
              <ResultDetails
                items={[
                  { label: 'Bill Amount', value: formatInr(result.bill) },
                  { label: `Tax (${result.taxRate}%)`, value: formatInr(result.tax) },
                  { label: `Tip (${result.tipRate}%)`, value: formatInr(result.tip) },
                  { label: 'Total to Pay', value: formatInr(result.total) },
                ]}
              />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="bill-amount" label="Bill amount (₹)" value={bill} onChange={setBill} error={errors.bill} />
        <CalculatorInput id="bill-people" label="Number of people" inputMode="numeric" value={people} onChange={setPeople} error={errors.people} />
        <CalculatorInput id="bill-tax" label="Tax (optional)" suffix="%" value={tax} onChange={setTax} error={errors.tax} />
        <CalculatorInput id="bill-tip" label="Tip (optional)" suffix="%" value={tip} onChange={setTip} error={errors.tip} />
        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
          <input type="checkbox" checked={roundUp} onChange={(event) => setRoundUp(event.target.checked)} className="size-5 cursor-pointer accent-primary" />
          Round each share up to a whole rupee
        </label>
      </CalculatorShell>
    </ToolLayout>
  );
}
