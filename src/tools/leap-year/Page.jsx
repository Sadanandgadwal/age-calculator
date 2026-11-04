import { useState } from 'react';
import { ArrowLeft, ArrowRight, CalendarCheck, CalendarHeart, CalendarX } from 'lucide-react';
import * as content from './content.js';
import { buildResultText, evaluate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

const yesNo = (value) => (value ? 'Yes' : 'No');

export default function LeapYearCheckerPage() {
  const [year, setYear] = useState('');
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate(year) : { errors: {} };

  const reset = () => {
    setYear('');
    form.clear();
  };

  return (
    <ToolLayout toolId="leap-year-checker" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter a year"
        onReset={reset}
        panel={{ title: 'Your Result', icon: CalendarHeart, emptyText: 'Enter a year and select Calculate to check it.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                <ResultCard label="Leap Year" value={yesNo(result.isLeap)} icon={result.isLeap ? CalendarCheck : CalendarX} />
                <ResultCard label="Next Leap Year" value={result.next} icon={ArrowRight} tone="yellow" />
                <ResultCard label="Previous Leap Year" value={result.previous ?? 'None'} icon={ArrowLeft} tone="lavender" />
              </div>
              <p className="mt-4 rounded-xl bg-secondary px-4 py-3 text-sm font-semibold">{result.explanation}</p>
              <ResultDetails
                items={[
                  { label: 'Divides by 4', value: yesNo(result.divisibleBy4) },
                  { label: 'Divides by 100', value: yesNo(result.divisibleBy100) },
                  { label: 'Divides by 400', value: yesNo(result.divisibleBy400) },
                  { label: 'Days in the Year', value: result.daysInYear },
                  { label: 'Days in February', value: result.daysInFebruary },
                ]}
              />
              <ResultActions getText={() => buildResultText(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="leap-year" label="Year" inputMode="numeric" value={year} onChange={setYear} error={errors.year} />
      </CalculatorShell>
    </ToolLayout>
  );
}
