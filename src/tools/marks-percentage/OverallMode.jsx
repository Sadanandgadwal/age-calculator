import { useRef, useState } from 'react';
import { Award, Percent, Sigma } from 'lucide-react';
import { buildOverallReport, buildOverallText, calculateOverall, getGrade, validateMarks } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import { useSubmitFocus } from '../../hooks/useSubmitFocus.js';
import { formatDecimal } from '../../utils/number.js';

export default function OverallMode({ gradeRows, isScaleValid }) {
  const [obtained, setObtained] = useState('');
  const [max, setMax] = useState('');
  const [submitCount, setSubmitCount] = useState(0);
  const formRef = useRef(null);
  const headingRef = useRef(null);

  useSubmitFocus(submitCount, formRef, headingRef);

  const errors = submitCount > 0 ? validateMarks(obtained, max) : {};
  const result = submitCount > 0 && Object.keys(errors).length === 0 ? calculateOverall(obtained, max) : null;
  const grade = result && isScaleValid ? getGrade(result.percent, gradeRows) : null;

  const reset = () => {
    setObtained('');
    setMax('');
    setSubmitCount(0);
  };

  return (
    <div className="grid items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <section aria-label="Enter your total marks" className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
        <form
          ref={formRef}
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            setSubmitCount((count) => count + 1);
          }}
          className="flex flex-col gap-5"
        >
          <CalculatorInput id="overall-obtained" label="Total obtained marks" value={obtained} onChange={setObtained} error={errors.obtained} />
          <CalculatorInput id="overall-max" label="Total maximum marks" value={max} onChange={setMax} error={errors.max} />
          <FormActions onReset={reset} />
        </form>
      </section>

      <ResultPanel ref={headingRef} emptyText="Enter your total marks and select Calculate to see your percentage.">
        {result && (
          <>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <ResultCard label="Percentage" value={`${formatDecimal(result.percent)}%`} icon={Percent} />
              <ResultCard label="Grade" value={grade ?? '—'} icon={Award} tone="yellow" />
              <ResultCard label="Marks Lost" value={formatDecimal(result.remaining)} icon={Sigma} tone="lavender" />
            </div>
            <ResultActions getText={() => buildOverallText(result, grade)} getReport={() => buildOverallReport(result, grade)} />
          </>
        )}
      </ResultPanel>
    </div>
  );
}
