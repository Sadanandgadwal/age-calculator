import { useState } from 'react';
import { ChartPie, Percent, Tags } from 'lucide-react';
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

export default function MarkupCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const form = useCalculatorForm();

  const mode = getMode(modeId);
  const { errors, result } = form.submitted ? evaluate(modeId, a, b) : { errors: {} };
  const rows = result ? getRows(result) : [];

  const reset = () => {
    setA('');
    setB('');
    form.clear();
  };

  return (
    <ToolLayout toolId="markup-calculator" content={content}>
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
        formLabel="Enter your prices"
        formTitle={mode.title}
        onReset={reset}
        panel={{ title: 'Your Price', icon: Tags, emptyText: 'Enter your values and select Calculate to see the price, markup and margin.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={rows[0].label} value={rows[0].value} icon={Tags} />
                <ResultCard label={rows[1].label} value={rows[1].value} icon={Percent} tone="yellow" />
                <ResultCard label={rows[2].label} value={rows[2].value} icon={ChartPie} tone="lavender" />
              </div>
              <ResultDetails items={rows.slice(3)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(mode, a, b, result)} />
            </>
          )
        }
      >
        <CalculatorInput id="markup-a" label={mode.labelA} value={a} onChange={setA} error={errors.a} />
        <CalculatorInput id="markup-b" label={mode.labelB} suffix={mode.suffixB} value={b} onChange={setB} error={errors.b} />
      </CalculatorShell>
    </ToolLayout>
  );
}
