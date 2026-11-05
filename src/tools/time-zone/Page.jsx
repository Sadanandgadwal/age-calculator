import { useState } from 'react';
import { ArrowUpDown, CalendarDays, Clock, Globe } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, evaluate } from './logic.js';
import { ZONE_GROUPS } from './zones.js';
import DateField from '../../components/calculator/DateField.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TimeField from '../../components/common/TimeField.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { getTodayIso } from '../../utils/date.js';

const DEFAULT_FROM = 'Asia/Kolkata';
const DEFAULT_TO = 'America/New_York';

function ZoneSelect({ id, label, value, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint"
      >
        {ZONE_GROUPS.map(({ name, zones }) => (
          <optgroup key={name} label={name}>
            {zones.map((zone) => (
              <option key={zone.id} value={zone.id}>
                {zone.label}
              </option>
            ))}
          </optgroup>
        ))}
      </select>
    </div>
  );
}

export default function TimeZoneConverterPage() {
  const [date, setDate] = useState(getTodayIso);
  const [time, setTime] = useState('');
  const [from, setFrom] = useState(DEFAULT_FROM);
  const [to, setTo] = useState(DEFAULT_TO);
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate({ date, time, from, to }) : { errors: {} };

  const reset = () => {
    setDate(getTodayIso());
    setTime('');
    setFrom(DEFAULT_FROM);
    setTo(DEFAULT_TO);
    form.clear();
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <ToolLayout toolId="time-zone-converter" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter a date, time and time zones"
        onReset={reset}
        panel={{ title: 'Converted Time', icon: Globe, emptyText: 'Enter a date and time, then select Calculate to convert it.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-2">
                <ResultCard label={result.target.name} value={result.target.time} icon={Clock} />
                <ResultCard label={result.dayChange} value={result.target.dateText} icon={CalendarDays} tone="lavender" />
              </div>
              {result.note && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{result.note}</p>}
              <ResultDetails
                items={[
                  { label: 'From', value: `${result.source.time}, ${result.source.dateText}` },
                  { label: 'From Time Zone', value: `${result.source.label} (${result.source.offset})` },
                  { label: 'To', value: `${result.target.time}, ${result.target.dateText}` },
                  { label: 'To Time Zone', value: `${result.target.label} (${result.target.offset})` },
                  { label: 'Time Difference', value: result.difference },
                ]}
              />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <DateField id="tz-date" label="Date" icon={CalendarDays} value={date} onChange={setDate} error={errors.date} min="1900-01-01" max="2100-12-31" />
        <TimeField id="tz-time" label="Time" value={time} onChange={setTime} error={errors.time} />
        <ZoneSelect id="tz-from" label="From time zone" value={from} onChange={setFrom} />
        <button
          type="button"
          aria-label="Swap time zones"
          onClick={swap}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-line bg-white px-5 font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2"
        >
          <ArrowUpDown aria-hidden="true" className="size-5" />
          Swap
        </button>
        <ZoneSelect id="tz-to" label="To time zone" value={to} onChange={setTo} />
      </CalculatorShell>
    </ToolLayout>
  );
}
