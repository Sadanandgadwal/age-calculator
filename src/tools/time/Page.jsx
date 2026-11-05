import { useState } from 'react';
import { CalendarDays, Clock, Hourglass, Timer } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, buildResultText, evaluate, formatDuration, getDurationTotals, getMode } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TimeField from '../../components/common/TimeField.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

const EMPTY_DURATION = { hours: '', minutes: '', seconds: '' };
const PARTS = [
  ['hours', 'Hours', 'Hours'],
  ['minutes', 'Minutes', 'Minutes'],
  ['seconds', 'Seconds', 'Seconds'],
];

function DurationFields({ prefix, legend, value, onChange, errors }) {
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-extrabold">{legend}</legend>
      <div className="grid grid-cols-3 items-start gap-2">
        {PARTS.map(([part, label, errorKey]) => (
          <CalculatorInput
            key={part}
            id={`time-${prefix}-${part}`}
            inputMode="numeric"
            label={<><span className="sr-only">{legend} </span>{label}</>}
            value={value[part]}
            onChange={(next) => onChange({ ...value, [part]: next })}
            error={errors[`${prefix}${errorKey}`]}
          />
        ))}
      </div>
    </fieldset>
  );
}

function DurationResults({ result }) {
  return (
    <>
      <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
        <ResultCard label="Hours" value={result.hours.toLocaleString('en-IN')} icon={Clock} />
        <ResultCard label="Minutes" value={result.minutes} icon={Timer} tone="yellow" />
        <ResultCard label="Seconds" value={result.seconds} icon={Hourglass} tone="lavender" />
      </div>
      {result.note && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{result.note}</p>}
      <ResultDetails
        items={[
          { label: 'Calculation', value: result.summary },
          { label: 'Result', value: formatDuration(result.totalSeconds) },
          ...getDurationTotals(result),
        ]}
      />
    </>
  );
}

function ClockResults({ result }) {
  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
        <ResultCard label="Result Time" value={result.time} icon={Clock} />
        <ResultCard label="Day" value={result.dayChange} icon={CalendarDays} tone="lavender" />
      </div>
      <ResultDetails items={[{ label: 'Calculation', value: result.summary }]} />
    </>
  );
}

export default function TimeCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [a, setA] = useState(EMPTY_DURATION);
  const [b, setB] = useState(EMPTY_DURATION);
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const form = useCalculatorForm();

  const mode = getMode(modeId);
  const { errors, result } = form.submitted ? evaluate(modeId, { a, b, start, end }) : { errors: {} };
  const shows = (field) => mode.fields.includes(field);

  const reset = () => {
    setA(EMPTY_DURATION);
    setB(EMPTY_DURATION);
    setStart('');
    setEnd('');
    form.clear();
  };

  return (
    <ToolLayout toolId="time-calculator" content={content}>
      <div className="mb-6">
        <SegmentedControl
          label="Calculation mode"
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
        formLabel="Enter your times"
        formTitle={mode.title}
        onReset={reset}
        panel={{ title: 'Your Result', icon: Clock, emptyText: 'Enter your times and select Calculate to see the result.' }}
        results={
          result && (
            <>
              {result.kind === 'clock' ? <ClockResults result={result} /> : <DurationResults result={result} />}
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(mode, result)} />
            </>
          )
        }
      >
        {shows('start') && <TimeField id="time-start" label="Start time" value={start} onChange={setStart} error={errors.start} />}
        {shows('end') && <TimeField id="time-end" label="End time" value={end} onChange={setEnd} error={errors.end} />}
        {shows('a') && <DurationFields prefix="a" legend={mode.labelA} value={a} onChange={setA} errors={errors} />}
        {shows('b') && <DurationFields prefix="b" legend={mode.labelB} value={b} onChange={setB} errors={errors} />}
      </CalculatorShell>
    </ToolLayout>
  );
}
