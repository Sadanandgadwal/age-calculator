import { useRef, useState } from 'react';
import { Flag, Percent, Target } from 'lucide-react';
import { buildTargetText, calculateTarget, validateTarget } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import { useSubmitFocus } from '../../hooks/useSubmitFocus.js';
import { formatDecimal } from '../../utils/number.js';

const EMPTY = { target: '', obtained: '', maxSoFar: '', remaining: '' };

function statusMessage(result) {
  if (result.status === 'achieved') return 'You have already reached this target, even with no more marks.';
  if (result.status === 'impossible') {
    return `This target isn't reachable with the marks remaining. Your best possible result is ${formatDecimal(result.maxPossiblePercent)}%.`;
  }
  return `You need ${formatDecimal(result.needed)} of the ${formatDecimal(result.remaining)} marks remaining.`;
}

export default function TargetMode() {
  const [values, setValues] = useState(EMPTY);
  const [submitCount, setSubmitCount] = useState(0);
  const formRef = useRef(null);
  const headingRef = useRef(null);

  useSubmitFocus(submitCount, formRef, headingRef);

  const errors = submitCount > 0 ? validateTarget(values) : {};
  const result = submitCount > 0 && Object.keys(errors).length === 0 ? calculateTarget(values) : null;
  const set = (field) => (value) => setValues((current) => ({ ...current, [field]: value }));

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section aria-label="Enter your target" className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
        <form
          ref={formRef}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitCount((count) => count + 1);
          }}
          className="flex flex-col gap-5"
        >
          <CalculatorInput id="target-percent" label="Target percentage" suffix="%" value={values.target} onChange={set('target')} error={errors.target} />
          <CalculatorInput id="target-obtained" label="Marks obtained so far" value={values.obtained} onChange={set('obtained')} error={errors.obtained} />
          <CalculatorInput id="target-max" label="Maximum marks so far" value={values.maxSoFar} onChange={set('maxSoFar')} error={errors.maxSoFar} />
          <CalculatorInput id="target-remaining" label="Maximum marks remaining" value={values.remaining} onChange={set('remaining')} error={errors.remaining} />
          <FormActions
            onReset={() => {
              setValues(EMPTY);
              setSubmitCount(0);
            }}
          />
        </form>
      </section>

      <ResultPanel ref={headingRef} title="Your Target" icon={Target} emptyText="Enter your target and marks, then select Calculate to see what you need.">
        {result && (
          <>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <ResultCard label="Marks Needed" value={formatDecimal(result.needed)} icon={Flag} />
              <ResultCard label="Of Remaining" value={`${formatDecimal(result.neededPercent)}%`} icon={Percent} tone="yellow" />
              <ResultCard label="Best Possible" value={`${formatDecimal(result.maxPossiblePercent)}%`} icon={Target} tone="lavender" />
            </div>
            <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold">{statusMessage(result)}</p>
            <ResultDetails
              items={[
                { label: 'Total Maximum Marks', value: formatDecimal(result.totalMax) },
                { label: 'Total Marks For Target', value: formatDecimal(result.requiredTotal) },
                { label: 'Marks Remaining', value: formatDecimal(result.remaining) },
              ]}
            />
            <ResultActions getText={() => buildTargetText(result, values.target)} />
          </>
        )}
      </ResultPanel>
    </div>
  );
}
