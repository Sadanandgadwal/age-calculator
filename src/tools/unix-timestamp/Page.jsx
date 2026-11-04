import { useState } from 'react';
import { CalendarDays, Clock, Globe, Hash, Timer } from 'lucide-react';
import * as content from './content.js';
import { MODES, UNITS, ZONE_MODES, buildReport, buildResultText, currentDateTime, currentTimestamp, fromTimestamp, localZoneName, toTimestamp } from './logic.js';
import DateField from '../../components/calculator/DateField.jsx';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TimeField from '../../components/common/TimeField.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { MAX_DATE, MIN_DATE } from '../../utils/date.js';

export default function UnixTimestampPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [timestamp, setTimestamp] = useState('');
  const [unit, setUnit] = useState('seconds');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [zoneMode, setZoneMode] = useState('local');
  const form = useCalculatorForm();

  const isToDate = modeId === 'to-date';
  let outcome = { errors: {} };
  if (form.submitted) outcome = isToDate ? fromTimestamp(timestamp, unit) : toTimestamp({ date, time, zoneMode });
  const { errors, result } = outcome;

  const useNow = () => {
    const now = Date.now();
    if (isToDate) {
      setTimestamp(currentTimestamp(now, unit));
      return;
    }
    const current = currentDateTime(now, zoneMode);
    setDate(current.date);
    setTime(current.time);
  };

  const reset = () => {
    setTimestamp('');
    setUnit('seconds');
    setDate('');
    setTime('');
    setZoneMode('local');
    form.clear();
  };

  return (
    <ToolLayout toolId="unix-timestamp-converter" content={content}>
      <div className="mb-6">
        <SegmentedControl
          label="Conversion direction"
          options={MODES}
          value={modeId}
          onChange={(id) => {
            setModeId(id);
            form.clear();
          }}
        />
      </div>

      <CalculatorShell
        form={form}
        formLabel={isToDate ? 'Enter a timestamp' : 'Enter a date'}
        onReset={reset}
        panel={{ title: 'Converted Time', icon: Clock, emptyText: 'Enter a value and select Calculate to convert it.' }}
        results={
          result && (
            <>
              {result.hint && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{result.hint}</p>}
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-2">
                {isToDate ? (
                  <>
                    <ResultCard label="UTC" value={result.utc} icon={Globe} />
                    <ResultCard label={`Local (${localZoneName()})`} value={result.local} icon={CalendarDays} tone="lavender" />
                  </>
                ) : (
                  <>
                    <ResultCard label="Seconds" value={result.seconds} icon={Hash} />
                    <ResultCard label="Milliseconds" value={result.ms} icon={Timer} tone="lavender" />
                  </>
                )}
              </div>
              <ResultDetails
                items={[
                  { label: 'Unix Seconds', value: result.seconds },
                  { label: 'Unix Milliseconds', value: result.ms },
                  { label: 'UTC Time', value: result.utc },
                  { label: 'Local Time', value: result.local },
                  { label: 'ISO 8601', value: result.iso },
                ]}
              />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result, { isToDate, timestamp, unit, date, time, zoneMode })} />
            </>
          )
        }
      >
        {isToDate ? (
          <>
            <CalculatorInput id="unix-timestamp" label="Unix timestamp" inputMode="numeric" value={timestamp} onChange={setTimestamp} error={errors.timestamp} />
            <SegmentedControl label="Timestamp unit" options={UNITS} value={unit} onChange={setUnit} />
          </>
        ) : (
          <>
            <DateField id="unix-date" label="Date" icon={CalendarDays} value={date} onChange={setDate} error={errors.date} min={MIN_DATE} max={MAX_DATE} />
            <TimeField id="unix-time" label="Time (optional)" value={time} onChange={setTime} error={errors.time} />
            <SegmentedControl label="Time zone of the date" options={ZONE_MODES} value={zoneMode} onChange={setZoneMode} />
          </>
        )}
        <button
          type="button"
          onClick={useNow}
          className="inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 border-line bg-white px-5 font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2"
        >
          <Clock aria-hidden="true" className="size-5" />
          Use current time
        </button>
      </CalculatorShell>
    </ToolLayout>
  );
}
