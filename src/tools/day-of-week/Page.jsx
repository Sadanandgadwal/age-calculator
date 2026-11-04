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

export default function DayOfWeekPage() {
  const [date, setDate] = useState(getTodayIso);
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate(date, getTodayIso()) : { errors: {} };

  const reset = () => {
    setDate(getTodayIso());
    form.clear();
  };

  return (
    <ToolLayout toolId="day-of-week-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Choose a date"
        onReset={reset}
        panel={{ title: 'Day of the Week', icon: CalendarDays, summary: result ? formatDate(result.date) : undefined, emptyText: 'Choose a date and select Calculate to find its weekday.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label={result.isWeekend ? 'Weekend' : 'Weekday'} value={result.weekday} icon={CalendarDays} />
                <ResultCard label="Day of the Year" value={result.dayOfYear} icon={Hash} tone="yellow" />
                <ResultCard label="ISO Week" value={result.week} icon={CalendarRange} tone="lavender" />
              </div>
              <ResultDetails
                items={[
                  { label: 'Date', value: formatDate(result.date) },
                  { label: 'From Today', value: result.relative },
                  { label: 'Days in the Year', value: result.daysInYear },
                  { label: 'Days in the Month', value: result.daysInMonth },
                  { label: 'Leap Year', value: result.isLeapYear ? 'Yes' : 'No' },
                ]}
              />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <DateField id="dow-date" label="Date" icon={CalendarDays} value={date} onChange={setDate} error={errors.date} min={MIN_DATE} max={MAX_DATE} />
      </CalculatorShell>
    </ToolLayout>
  );
}
