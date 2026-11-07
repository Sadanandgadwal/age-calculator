import { useState } from 'react';
import { CalendarClock, Landmark, Sprout } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, describeCovered, evaluate, getRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

const DEFAULTS = { age: '', retireAge: '60', lifeAge: '85', expenses: '', inflation: '6', preReturn: '10', postReturn: '7', savings: '' };

const FIELDS = [
  ['age', 'Current age', { inputMode: 'numeric' }],
  ['retireAge', 'Retirement age', { inputMode: 'numeric' }],
  ['lifeAge', 'Plan up to age', { inputMode: 'numeric' }],
  ['expenses', 'Monthly expenses today (₹)', {}],
  ['inflation', 'Inflation (% a year)', { suffix: '%' }],
  ['preReturn', 'Return before retirement (% a year)', { suffix: '%' }],
  ['postReturn', 'Return after retirement (% a year)', { suffix: '%' }],
  ['savings', 'Retirement savings so far (₹, optional)', {}],
];

export default function RetirementCalculatorPage() {
  const [values, setValues] = useState(DEFAULTS);
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate(values) : { errors: {} };
  const rows = result ? getRows(result) : [];
  const covered = result ? describeCovered(result) : null;

  const reset = () => {
    setValues(DEFAULTS);
    form.clear();
  };

  return (
    <ToolLayout toolId="retirement-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your retirement plans"
        note="These are estimates, not financial advice. Real returns and inflation vary, and tax is not included."
        onReset={reset}
        panel={{ title: 'Your Retirement Plan', icon: Sprout, emptyText: 'Enter your details and select Calculate to see how much you need.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={Landmark} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Sprout} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={CalendarClock} tone="lavender" />
              </div>
              {covered && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{covered}</p>}
              <ResultDetails items={rows.slice(3)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        {FIELDS.map(([key, label, extra]) => (
          <CalculatorInput key={key} id={`retire-${key}`} label={label} value={values[key]} onChange={(next) => setValues((current) => ({ ...current, [key]: next }))} error={errors[key]} {...extra} />
        ))}
      </CalculatorShell>
    </ToolLayout>
  );
}
