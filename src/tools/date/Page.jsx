import { useRef, useState } from 'react';
import { CalendarCheck, CalendarDays, CalendarRange, CalendarSearch, Clock, Sun, Sunset } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildResultText, evaluate, formatDuration, formatWeeks, getMode, shiftSummary } from './logic.js';
import DateField from '../../components/calculator/DateField.jsx';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CopyButton from '../../components/common/CopyButton.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useSubmitFocus } from '../../hooks/useSubmitFocus.js';
import { MAX_DATE, MIN_DATE, formatDate, getTodayIso, getWeekday } from '../../utils/date.js';
import { formatNumber, pluralize } from '../../utils/formatResult.js';

const longDate = (date) => `${getWeekday(date)}, ${formatDate(date)}`;

function RangeResults({ mode, result }) {
  return (
    <>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <ResultCard label="Total Days" value={formatNumber(result.totalDays)} icon={CalendarDays} />
        <ResultCard label={mode.business ? 'Business Days' : 'Weekdays'} value={formatNumber(result.weekdays)} icon={Sun} tone="yellow" />
        <ResultCard label="Weekend Days" value={formatNumber(result.weekends)} icon={Sunset} tone="lavender" />
      </div>
      <ResultDetails
        items={[
          { label: 'Start Date', value: longDate(result.start) },
          { label: 'End Date', value: longDate(result.end) },
          { label: 'End Date Counted', value: result.includeEnd ? 'Yes' : 'No' },
          { label: 'Total Weeks', value: formatWeeks(result) },
          { label: 'Total Months', value: pluralize(result.totalMonths, 'month') },
          { label: 'Years, Months and Days', value: formatDuration(result) },
        ]}
      />
      {mode.business && <p className="mt-4 text-sm text-ink/80">Business days are Monday to Friday. Public holidays are not removed.</p>}
    </>
  );
}

function ShiftResults({ result }) {
  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
        <ResultCard label="Result Date" value={formatDate(result.end)} icon={CalendarCheck} />
        <ResultCard label="Day of the Week" value={getWeekday(result.end)} icon={Clock} tone="lavender" />
      </div>
      {result.clamped && (
        <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">
          That month has no day {result.start.day}, so the result uses the last day of the month.
        </p>
      )}
      <ResultDetails
        items={[
          { label: 'Calculation', value: shiftSummary(result) },
          { label: 'Start Date', value: longDate(result.start) },
          { label: 'End Date', value: longDate(result.end) },
          { label: 'Total Days', value: pluralize(result.totalDays, 'day') },
          { label: 'Total Weeks', value: formatWeeks(result) },
          { label: 'Years, Months and Days', value: formatDuration(result) },
        ]}
      />
    </>
  );
}

export default function DateCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [start, setStart] = useState(getTodayIso);
  const [end, setEnd] = useState('');
  const [amount, setAmount] = useState('');
  const [includeEnd, setIncludeEnd] = useState(MODES[0].defaultIncludeEnd);
  const [incomplete, setIncomplete] = useState({ start: false, end: false });
  const [submitCount, setSubmitCount] = useState(0);
  const formRef = useRef(null);
  const headingRef = useRef(null);
  const startRef = useRef(null);
  const endRef = useRef(null);

  useSubmitFocus(submitCount, formRef, headingRef);

  const mode = getMode(modeId);
  const { errors, result } =
    submitCount > 0
      ? evaluate(mode, { start, end, amount, includeEnd, startIncomplete: incomplete.start, endIncomplete: incomplete.end })
      : { errors: {} };

  const clearResults = () => {
    setSubmitCount(0);
    setIncomplete({ start: false, end: false });
  };

  const changeMode = (id) => {
    setModeId(id);
    setAmount('');
    setIncludeEnd(Boolean(getMode(id).defaultIncludeEnd));
    clearResults();
  };

  const reset = () => {
    formRef.current?.reset();
    setStart(getTodayIso());
    setEnd('');
    setAmount('');
    setIncludeEnd(Boolean(mode.defaultIncludeEnd));
    clearResults();
  };

  const submit = (event) => {
    event.preventDefault();
    setIncomplete({
      start: Boolean(startRef.current?.validity.badInput),
      end: Boolean(endRef.current?.validity.badInput),
    });
    setSubmitCount((count) => count + 1);
  };

  return (
    <ToolLayout toolId="date-calculator" content={content}>
      <div className="mb-6">
        <SegmentedControl label="Calculation mode" options={MODES} value={modeId} onChange={changeMode} />
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-label="Enter your dates" className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
          <h2 className="mb-5 text-lg font-extrabold tracking-tight">{mode.title}</h2>
          <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-5">
            <DateField
              ref={startRef}
              id="date-start"
              label="Start Date"
              icon={CalendarDays}
              value={start}
              min={MIN_DATE}
              max={MAX_DATE}
              error={errors.start}
              onChange={(value) => {
                setStart(value);
                setIncomplete((current) => ({ ...current, start: false }));
              }}
            />

            {mode.kind === 'range' ? (
              <>
                <DateField
                  ref={endRef}
                  id="date-end"
                  label="End Date"
                  icon={CalendarCheck}
                  value={end}
                  min={start || MIN_DATE}
                  max={MAX_DATE}
                  error={errors.end}
                  onChange={(value) => {
                    setEnd(value);
                    setIncomplete((current) => ({ ...current, end: false }));
                  }}
                />
                <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm font-semibold">
                  <input
                    type="checkbox"
                    checked={includeEnd}
                    onChange={(event) => setIncludeEnd(event.target.checked)}
                    className="size-5 cursor-pointer accent-primary"
                  />
                  Include the end date in the count
                </label>
              </>
            ) : (
              <CalculatorInput id="date-amount" label={mode.amountLabel} inputMode="numeric" value={amount} onChange={setAmount} error={errors.amount} />
            )}

            <FormActions onReset={reset} />
          </form>
        </section>

        <ResultPanel ref={headingRef} icon={CalendarSearch} emptyText="Enter your details and select Calculate to see the results.">
          {result && (
            <>
              {result.kind === 'range' ? <RangeResults mode={mode} result={result} /> : <ShiftResults result={result} />}
              <CopyButton getText={() => buildResultText(mode, result)} />
            </>
          )}
        </ResultPanel>
      </div>
    </ToolLayout>
  );
}
