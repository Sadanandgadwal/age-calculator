import { useState } from 'react';
import { GraduationCap, Percent } from 'lucide-react';
import * as content from './content.js';
import { CLIPPED_NOTE, FORMULAS, buildReport, buildResultText, evaluate, getRows } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

export default function CgpaToPercentagePage() {
  const [cgpa, setCgpa] = useState('');
  const [formulaId, setFormulaId] = useState(FORMULAS[0].id);
  const [multiplier, setMultiplier] = useState('');
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate({ cgpa, formulaId, multiplier }) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setCgpa('');
    setFormulaId(FORMULAS[0].id);
    setMultiplier('');
    form.clear();
  };

  return (
    <ToolLayout toolId="cgpa-to-percentage-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your CGPA"
        note="Universities set their own rules. Use the formula printed on your grade card or published by your university."
        onReset={reset}
        panel={{ title: 'Your Percentage', icon: Percent, emptyText: 'Enter your CGPA and select Calculate to see the percentage.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:grid-cols-2 sm:gap-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={Percent} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={GraduationCap} tone="yellow" />
              </div>
              <ResultDetails items={rows.slice(2)} />
              {result.clipped && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{CLIPPED_NOTE}</p>}
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="cgpa-value" label="CGPA (out of 10)" value={cgpa} onChange={setCgpa} error={errors.cgpa} />
        <div>
          <label htmlFor="cgpa-formula" className="block text-sm font-bold text-ink">
            Conversion formula
          </label>
          <select
            id="cgpa-formula"
            value={formulaId}
            onChange={(event) => setFormulaId(event.target.value)}
            className="mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint"
          >
            {FORMULAS.map(({ id, name }) => (
              <option key={id} value={id}>
                {name}
              </option>
            ))}
          </select>
        </div>
        {formulaId === 'custom' && <CalculatorInput id="cgpa-multiplier" label="Multiplier" value={multiplier} onChange={setMultiplier} error={errors.multiplier} />}
      </CalculatorShell>
    </ToolLayout>
  );
}
