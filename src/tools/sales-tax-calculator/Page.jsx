import { useState } from 'react';
import { Percent, Receipt, Tag } from 'lucide-react';
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

export default function SalesTaxCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');
  const form = useCalculatorForm();

  const mode = getMode(modeId);
  const { errors, result } = form.submitted ? evaluate(modeId, amount, rate) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setAmount('');
    setRate('');
    form.clear();
  };

  return (
    <ToolLayout toolId="sales-tax-calculator" content={content}>
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
        formLabel="Enter your price"
        formTitle={mode.title}
        note="For GST with CGST, SGST and IGST, use the GST Calculator."
        onReset={reset}
        panel={{ title: 'Your Tax', icon: Receipt, emptyText: 'Enter the price and tax rate, then select Calculate.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={Percent} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Tag} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={Receipt} tone="lavender" />
              </div>
              <ResultDetails items={rows.slice(3)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(mode, amount, rate, result)} />
            </>
          )
        }
      >
        <CalculatorInput id="tax-amount" label={mode.labelA} value={amount} onChange={setAmount} error={errors.amount} />
        <CalculatorInput id="tax-rate" label="Tax rate" suffix="%" value={rate} onChange={setRate} error={errors.rate} />
      </CalculatorShell>
    </ToolLayout>
  );
}
