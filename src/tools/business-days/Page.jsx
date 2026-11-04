import { useState } from 'react';
import { BriefcaseBusiness, CalendarCheck, CalendarDays, CalendarX, Plus, Sunset, X } from 'lucide-react';
import * as content from './content.js';
import { DEFAULT_WEEKEND, addHoliday, buildResultText, describeWeekend, evaluate } from './logic.js';
import DateField from '../../components/calculator/DateField.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { WEEKDAY_NAMES } from '../../utils/calendar.js';
import { MAX_DATE, MIN_DATE, formatDate, getTodayIso, parseDate } from '../../utils/date.js';
import { formatNumber, pluralize } from '../../utils/formatResult.js';

const smallButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-white px-3 text-sm font-bold text-primary outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';

export default function BusinessDaysPage() {
  const [start, setStart] = useState(getTodayIso);
  const [end, setEnd] = useState('');
  const [weekend, setWeekend] = useState(DEFAULT_WEEKEND);
  const [includeEnd, setIncludeEnd] = useState(true);
  const [holidayText, setHolidayText] = useState('');
  const [holidayError, setHolidayError] = useState();
  const [holidays, setHolidays] = useState([]);
  const form = useCalculatorForm();

  const { errors, result } = form.submitted ? evaluate({ start, end, weekend, holidays, includeEnd }) : { errors: {} };

  const toggleWeekend = (index) =>
    setWeekend((current) => (current.includes(index) ? current.filter((day) => day !== index) : [...current, index]));

  const add = () => {
    const next = addHoliday(holidays, holidayText);
    setHolidayError(next.error);
    setHolidays(next.holidays);
    if (!next.error) setHolidayText('');
  };

  const reset = () => {
    setStart(getTodayIso());
    setEnd('');
    setWeekend(DEFAULT_WEEKEND);
    setIncludeEnd(true);
    setHolidayText('');
    setHolidayError(undefined);
    setHolidays([]);
    form.clear();
  };

  return (
    <ToolLayout toolId="business-days-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your dates"
        onReset={reset}
        panel={{ title: 'Working Days', icon: BriefcaseBusiness, emptyText: 'Choose your dates and select Calculate to count the working days.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
                <ResultCard label="Working Days" value={formatNumber(result.working)} icon={BriefcaseBusiness} />
                <ResultCard label="Weekend Days" value={formatNumber(result.weekends)} icon={Sunset} tone="yellow" />
                <ResultCard label="Holidays" value={formatNumber(result.holidaysExcluded)} icon={CalendarX} tone="lavender" />
              </div>
              <ResultDetails
                items={[
                  { label: 'Total Calendar Days', value: pluralize(result.totalDays, 'day') },
                  { label: 'Start Date', value: formatDate(result.start) },
                  { label: 'End Date', value: formatDate(result.end) },
                  { label: 'End Date Counted', value: result.includeEnd ? 'Yes' : 'No' },
                  { label: 'Weekend', value: describeWeekend(weekend) },
                ]}
              />
              <ResultActions getText={() => buildResultText(result, weekend)} />
            </>
          )
        }
      >
        <DateField id="biz-start" label="Start date" icon={CalendarDays} value={start} onChange={setStart} error={errors.start} min={MIN_DATE} max={MAX_DATE} />
        <DateField id="biz-end" label="End date" icon={CalendarCheck} value={end} onChange={setEnd} error={errors.end} min={start || MIN_DATE} max={MAX_DATE} />

        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
          <input type="checkbox" checked={includeEnd} onChange={(event) => setIncludeEnd(event.target.checked)} className="size-5 cursor-pointer accent-primary" />
          Include the end date in the count
        </label>

        <fieldset>
          <legend className="text-sm font-bold">Weekend days</legend>
          <div className="mt-2 grid grid-cols-2 gap-x-3 sm:grid-cols-3 md:grid-cols-2">
            {WEEKDAY_NAMES.map((name, index) => (
              <label key={name} className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium">
                <input type="checkbox" checked={weekend.includes(index)} onChange={() => toggleWeekend(index)} className="size-5 cursor-pointer accent-primary" />
                {name}
              </label>
            ))}
          </div>
          {errors.weekend && <p className="mt-1.5 text-sm font-medium text-danger">{errors.weekend}</p>}
        </fieldset>

        <div>
          <DateField id="biz-holiday" label="Holiday date (optional)" icon={CalendarX} value={holidayText} onChange={setHolidayText} error={holidayError} min={MIN_DATE} max={MAX_DATE} />
          <button type="button" onClick={add} className={`${smallButton} mt-3 w-full`}>
            <Plus aria-hidden="true" className="size-4" />
            Add holiday
          </button>
          {holidays.length > 0 && (
            <ul aria-label="Holidays" className="mt-3 flex flex-col gap-2">
              {holidays.map((holiday) => (
                <li key={holiday} className="flex items-center justify-between gap-3 rounded-xl bg-page px-3 py-1 text-sm font-medium">
                  {formatDate(parseDate(holiday))}
                  <button
                    type="button"
                    aria-label={`Remove ${formatDate(parseDate(holiday))}`}
                    onClick={() => setHolidays((current) => current.filter((item) => item !== holiday))}
                    className="grid size-11 cursor-pointer place-items-center rounded-xl text-primary outline-none hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint"
                  >
                    <X aria-hidden="true" className="size-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </CalculatorShell>
    </ToolLayout>
  );
}
