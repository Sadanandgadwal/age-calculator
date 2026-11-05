import { useRef, useState } from 'react';
import { Info, Landmark, Percent, ReceiptIndianRupee, Wallet } from 'lucide-react';
import * as content from './content.js';
import { CURRENT_RATES, CUSTOM_RATE, DEFAULT_RATE, OLDER_RATES, buildReport, buildResultText, evaluate, formatInr, formatRate, getBreakdown } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useSubmitFocus } from '../../hooks/useSubmitFocus.js';

const DIRECTIONS = [
  { id: 'add', name: 'Add GST' },
  { id: 'remove', name: 'Remove GST' },
];
const TRANSACTIONS = [
  { id: 'intra', name: 'Intra-state' },
  { id: 'inter', name: 'Inter-state' },
];
const AMOUNT_LABELS = { add: 'Amount before GST', remove: 'Amount including GST' };

const rateOption = (rate) => (
  <option key={rate} value={rate}>
    {formatRate(Number(rate))}
  </option>
);

export default function GstCalculatorPage() {
  const [amount, setAmount] = useState('');
  const [rateChoice, setRateChoice] = useState(DEFAULT_RATE);
  const [customRate, setCustomRate] = useState('');
  const [direction, setDirection] = useState('add');
  const [transaction, setTransaction] = useState('intra');
  const [submitCount, setSubmitCount] = useState(0);
  const formRef = useRef(null);
  const headingRef = useRef(null);

  useSubmitFocus(submitCount, formRef, headingRef);

  const { errors, result } =
    submitCount > 0 ? evaluate({ amount, rateChoice, customRate, direction, transaction }) : { errors: {} };

  const reset = () => {
    setAmount('');
    setRateChoice(DEFAULT_RATE);
    setCustomRate('');
    setDirection('add');
    setTransaction('intra');
    setSubmitCount(0);
  };

  return (
    <ToolLayout toolId="gst-calculator" content={content}>
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-label="Enter your GST details" className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
          <form
            ref={formRef}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitCount((count) => count + 1);
            }}
            className="flex flex-col gap-5"
          >
            <SegmentedControl label="Calculation" options={DIRECTIONS} value={direction} onChange={setDirection} />
            <CalculatorInput id="gst-amount" label={`${AMOUNT_LABELS[direction]} (₹)`} value={amount} onChange={setAmount} error={errors.amount} />

            <div>
              <label htmlFor="gst-rate" className="block text-sm font-bold text-ink">
                GST rate
              </label>
              <select
                id="gst-rate"
                value={rateChoice}
                onChange={(event) => setRateChoice(event.target.value)}
                className="mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint"
              >
                <optgroup label="Current rates">{CURRENT_RATES.map(rateOption)}</optgroup>
                <optgroup label="Older rates">{OLDER_RATES.map(rateOption)}</optgroup>
                <option value={CUSTOM_RATE}>Custom rate</option>
              </select>
            </div>

            {rateChoice === CUSTOM_RATE && (
              <CalculatorInput id="gst-custom-rate" label="Custom GST rate" suffix="%" value={customRate} onChange={setCustomRate} error={errors.customRate} />
            )}

            <div>
              <p className="mb-2 text-sm font-bold text-ink">Transaction type</p>
              <SegmentedControl label="Transaction type" options={TRANSACTIONS} value={transaction} onChange={setTransaction} />
            </div>

            <FormActions onReset={reset} />
          </form>

          <p className="mt-5 flex items-start gap-2 text-sm text-ink/80">
            <Info aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
            This calculator provides estimates and does not replace professional tax advice.
          </p>
        </section>

        <ResultPanel ref={headingRef} title="GST Breakdown" icon={ReceiptIndianRupee} emptyText="Enter an amount and select Calculate to see the full GST breakdown.">
          {result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Taxable Amount" value={formatInr(result.taxable)} icon={Wallet} />
                <ResultCard label="Total GST" value={formatInr(result.gst)} icon={Percent} tone="yellow" />
                <ResultCard label="Final Amount" value={formatInr(result.final)} icon={Landmark} tone="lavender" />
              </div>
              <ResultDetails items={getBreakdown(result)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )}
        </ResultPanel>
      </div>
    </ToolLayout>
  );
}
