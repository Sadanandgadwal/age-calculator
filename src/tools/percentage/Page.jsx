import { useRef, useState } from 'react';
import { Percent } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, buildResultText, evaluate, getMode } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useSubmitFocus } from '../../hooks/useSubmitFocus.js';

export default function PercentagePage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [submitCount, setSubmitCount] = useState(0);
  const formRef = useRef(null);
  const headingRef = useRef(null);

  useSubmitFocus(submitCount, formRef, headingRef);

  const mode = getMode(modeId);
  const { errors, result } = submitCount > 0 ? evaluate(modeId, a, b) : { errors: {} };

  const reset = () => {
    setA('');
    setB('');
    setSubmitCount(0);
  };

  return (
    <ToolLayout toolId="percentage-calculator" content={content}>
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

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-label="Enter your values" className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
          <h2 className="mb-5 text-lg font-extrabold tracking-tight">{mode.title}</h2>
          <form
            ref={formRef}
            noValidate
            onSubmit={(event) => {
              event.preventDefault();
              setSubmitCount((count) => count + 1);
            }}
            className="flex flex-col gap-5"
          >
            <CalculatorInput id="percent-a" label={mode.labelA} suffix={mode.suffixA} value={a} onChange={setA} error={errors.a} />
            <CalculatorInput id="percent-b" label={mode.labelB} suffix={mode.suffixB} value={b} onChange={setB} error={errors.b} />
            <FormActions onReset={reset} />
          </form>
        </section>

        <ResultPanel ref={headingRef} title="Result" icon={Percent} emptyText="Enter your values and select Calculate to see the answer and its working.">
          {result && (
            <>
              <div className="mt-5">
                <ResultCard label={result.sentence} value={result.display} />
              </div>
              <h3 className="mt-5 text-sm font-bold">Formula</h3>
              <p className="mt-1 rounded-xl bg-page px-4 py-3 text-sm font-medium break-words">{mode.formula}</p>
              <h3 className="mt-5 text-sm font-bold">Calculation steps</h3>
              <ol className="mt-1 flex flex-col gap-1.5 rounded-xl bg-page px-4 py-3 text-sm font-medium">
                {result.steps.map((step) => (
                  <li key={step} className="break-words">{step}</li>
                ))}
              </ol>
              <ResultActions getText={() => buildResultText(mode, result)} getReport={() => buildReport(mode, a, b, result)} />
            </>
          )}
        </ResultPanel>
      </div>
    </ToolLayout>
  );
}
