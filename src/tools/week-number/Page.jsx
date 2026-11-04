import { useState } from 'react';
import { CalendarDays, CalendarRange, Hash } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, evaluate } from './logic.js';
import DateField from '../../components/calculator/DateField.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { MAX_DATE, MIN_DATE, formatDate, getTodayIso } from '../../utils/date.js';

export default function WeekNumberPage() {
  const [date, setDate] = useState(getTodayIso);
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate(date) : { errors: {} };

  const reset = () => {
    setDate(getTodayIso());
    form.clear();
  };

  return (
    <ToolLayout toolId="week-number-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Choose a date"
        onReset={reset}
        panel={{ title: 'Your Week', icon: CalendarRange, summary: result ? formatDate(result.date) : undefined, emptyText: 'Choose a date and select Calculate to find its ISO week.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="ISO Week Number" value={result.week} icon={Hash} />
                <ResultCard label="Week Year" value={result.weekYear} icon={CalendarRange} tone="yellow" />
                <ResultCard label="Weekday" value={result.weekday} icon={CalendarDays} tone="lavender" />
              </div>
              {result.crossesYear && (
                <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">
                  This date is in {result.date.year}, but its ISO week belongs to {result.weekYear}.
                </p>
              )}
              <ResultDetails
                items={[
                  { label: 'Week Start (Monday)', value: formatDate(result.start) },
                  { label: 'Week End (Sunday)', value: formatDate(result.end) },
                  { label: 'Week Code', value: result.label },
                  { label: `Weeks in ${result.weekYear}`, value: result.weeksInYear },
                ]}
              />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <DateField id="week-date" label="Date" icon={CalendarDays} value={date} onChange={setDate} error={errors.date} min={MIN_DATE} max={MAX_DATE} />
      </CalculatorShell>
    </ToolLayout>
  );
}
