import { useState } from 'react';
import { ChartNoAxesCombined, Coins, Percent } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, describeShort, evaluate, getRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

export default function InvestmentReturnCalculatorPage() {
  const [invested, setInvested] = useState('');
  const [current, setCurrent] = useState('');
  const [years, setYears] = useState('');
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate({ invested, current, years }) : { errors: {} };
  const rows = result ? getRows(result) : [];
  const short = result ? describeShort(result) : null;

  const reset = () => {
    setInvested('');
    setCurrent('');
    setYears('');
    form.clear();
  };

  return (
    <ToolLayout toolId="investment-return-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your investment"
        onReset={reset}
        panel={{ title: 'Your Return', icon: ChartNoAxesCombined, emptyText: 'Enter what you invested, what it is worth now and how long you held it.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={ChartNoAxesCombined} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Percent} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={Coins} tone="lavender" />
              </div>
              {short && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{short}</p>}
              <ResultDetails items={rows.slice(3)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="return-invested" label="Amount invested (₹)" value={invested} onChange={setInvested} error={errors.invested} />
        <CalculatorInput id="return-current" label="Current value (₹)" value={current} onChange={setCurrent} error={errors.current} />
        <CalculatorInput id="return-years" label="Time held (years)" value={years} onChange={setYears} error={errors.years} />
      </CalculatorShell>
    </ToolLayout>
  );
}
