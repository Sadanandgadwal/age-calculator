import { useState } from 'react';
import { CalendarDays, Clock, Hourglass, PartyPopper, Timer } from 'lucide-react';
import * as content from './content.js';
import { buildResultText, describeEvent, evaluateTarget, splitCountdown } from './logic.js';
import DateField from '../../components/calculator/DateField.jsx';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CopyButton from '../../components/common/CopyButton.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import TimeField from '../../components/common/TimeField.jsx';
import TimerControls from '../../components/common/TimerControls.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useElapsedTimer } from '../../hooks/useElapsedTimer.js';
import { MAX_DATE, MIN_DATE } from '../../utils/date.js';

const IDLE = { status: 'idle', durationMs: null, targetLabel: '', eventName: '' };

export default function CountdownTimerPage() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [errors, setErrors] = useState({});
  const [run, setRun] = useState(IDLE);
  const timer = useElapsedTimer({
    limitMs: run.durationMs,
    onLimit: () => setRun((current) => ({ ...current, status: 'finished' })),
  });

  const parts = splitCountdown((run.durationMs ?? 0) - timer.elapsedMs);
  const isCounting = run.status === 'active';

  const start = () => {
    if (isCounting) {
      timer.start();
      return;
    }
    const { errors: nextErrors, targetMs, targetLabel } = evaluateTarget({ date, time });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    const durationMs = targetMs - Date.now();
    timer.reset();
    if (durationMs <= 0) {
      setRun({ status: 'passed', durationMs: null, targetLabel, eventName: name });
      return;
    }
    setRun({ status: 'active', durationMs, targetLabel, eventName: name });
    timer.start();
  };

  const reset = () => {
    timer.reset();
    setRun(IDLE);
    setErrors({});
    setName('');
    setDate('');
    setTime('');
  };

  return (
    <ToolLayout toolId="countdown-timer" content={content}>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section aria-label="Set your countdown" className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
          <form noValidate onSubmit={(event) => event.preventDefault()} className="flex flex-col gap-5">
            <CalculatorInput id="countdown-name" inputMode="text" label="Event name (optional)" value={name} onChange={setName} />
            <DateField id="countdown-date" label="Target date" icon={CalendarDays} value={date} onChange={setDate} error={errors.date} min={MIN_DATE} max={MAX_DATE} />
            <TimeField id="countdown-time" label="Target time (optional)" value={time} onChange={setTime} error={errors.time} />
            <TimerControls isRunning={timer.isRunning} hasStarted={isCounting && timer.hasStarted} onStart={start} onPause={timer.pause} onReset={reset} />
          </form>
        </section>

        <ResultPanel
          title={run.status === 'idle' ? 'Your Countdown' : `Time until ${describeEvent(run.eventName)}`}
          icon={Timer}
          summary={run.targetLabel && `Target: ${run.targetLabel}`}
          emptyText="Choose a target date and select Start to begin your countdown."
        >
          {run.status === 'idle' ? undefined : (
            <>
              <p role="status" className="mt-4 text-sm font-semibold text-primary empty:hidden">
                {run.status === 'finished' && 'Event reached!'}
                {run.status === 'passed' && 'This date and time has already passed. Choose a future date to start a countdown.'}
                {isCounting && !timer.isRunning && 'Paused'}
              </p>
              {run.status === 'finished' && <PartyPopper aria-hidden="true" className="mt-3 size-8 text-primary" />}
              {run.status !== 'passed' && (
                <>
                  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                    <ResultCard label="Days" value={parts.days.toLocaleString('en-IN')} icon={CalendarDays} />
                    <ResultCard label="Hours" value={parts.hours} icon={Clock} tone="yellow" />
                    <ResultCard label="Minutes" value={parts.minutes} icon={Timer} tone="lavender" />
                    <ResultCard label="Seconds" value={parts.seconds} icon={Hourglass} />
                  </div>
                  <CopyButton getText={() => buildResultText(run.eventName, run.targetLabel, parts)} />
                </>
              )}
            </>
          )}
        </ResultPanel>
      </div>
    </ToolLayout>
  );
}
