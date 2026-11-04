import { useState } from 'react';
import { Coffee, Flame, ListChecks, Trash2 } from 'lucide-react';
import * as content from './content.js';
import { DEFAULT_MINUTES, SESSIONS, buildResultText, completionMessage, focusUntilLongBreak, formatRemaining, getSession, nextSession, validateMinutes } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import { secondaryTimerButton } from '../../components/common/timerButtonClasses.js';
import TimerControls from '../../components/common/TimerControls.jsx';
import TimerDisplay from '../../components/common/TimerDisplay.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useElapsedTimer } from '../../hooks/useElapsedTimer.js';

const MINUTE_MS = 60000;
const FIELDS = [
  ['focus', 'Focus (minutes)'],
  ['short', 'Short break (minutes)'],
  ['long', 'Long break (minutes)'],
];

export default function PomodoroPage() {
  const [minutes, setMinutes] = useState(DEFAULT_MINUTES);
  const [sessionId, setSessionId] = useState('focus');
  const [completed, setCompleted] = useState(0);
  const [message, setMessage] = useState('');
  const [activeMs, setActiveMs] = useState(null);

  const timer = useElapsedTimer({
    limitMs: activeMs,
    onLimit: () => {
      const total = sessionId === 'focus' ? completed + 1 : completed;
      const next = nextSession(sessionId, total);
      setCompleted(total);
      setSessionId(next);
      setMessage(completionMessage(sessionId, next));
      setActiveMs(null);
      timer.reset();
    },
  });

  const { errors, values, isValid } = validateMinutes(minutes);
  const session = getSession(sessionId);
  const configuredMs = (values[sessionId] ?? 0) * MINUTE_MS;
  const remainingMs = activeMs === null ? configuredMs : activeMs - timer.elapsedMs;
  const isCurrentInvalid = activeMs === null && Boolean(errors[sessionId]);

  const start = () => {
    if (activeMs === null) setActiveMs(configuredMs);
    setMessage('');
    timer.start();
  };

  const clearRun = () => {
    timer.reset();
    setActiveMs(null);
    setMessage('');
  };

  const chooseSession = (id) => {
    clearRun();
    setSessionId(id);
  };

  return (
    <ToolLayout toolId="pomodoro-timer" content={content}>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section data-print-keep aria-label="Pomodoro timer" className="flex flex-col gap-5 rounded-3xl bg-card p-6 shadow-card sm:p-8">
          <SegmentedControl label="Current session" options={SESSIONS} value={sessionId} onChange={chooseSession} />
          <TimerDisplay value={isCurrentInvalid ? '--:--' : formatRemaining(remainingMs)} label={session.label} tone={session.tone} />
          <p role="status" className="text-center text-sm font-semibold text-primary empty:hidden">
            {message}
          </p>
          <TimerControls isRunning={timer.isRunning} hasStarted={timer.hasStarted} onStart={start} onPause={timer.pause} onReset={clearRun} disabled={isCurrentInvalid} />
        </section>

        <ResultPanel title="Your Progress" icon={ListChecks} emptyText="">
          <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
            <ResultCard label="Focus Sessions Completed" value={completed} icon={Flame} />
            <ResultCard label="Sessions Until Long Break" value={focusUntilLongBreak(completed)} icon={Coffee} tone="yellow" />
          </div>
          <ResultActions getText={() => buildResultText(session.label, formatRemaining(remainingMs), completed, values)} />
          <button type="button" disabled={completed === 0} onClick={() => setCompleted(0)} className={`${secondaryTimerButton} w-full print:hidden`}>
            <Trash2 aria-hidden="true" className="size-5" />
            Clear completed sessions
          </button>

          <form onSubmit={(event) => event.preventDefault()} className="mt-5 flex flex-col gap-4">
            <h3 className="font-extrabold">Session lengths</h3>
            {FIELDS.map(([id, label]) => (
              <CalculatorInput
                key={id}
                id={`pomodoro-${id}`}
                inputMode="numeric"
                label={label}
                value={minutes[id]}
                onChange={(value) => setMinutes((current) => ({ ...current, [id]: value }))}
                error={errors[id]}
              />
            ))}
            {!isValid && <p className="text-sm text-ink/80">Fix the lengths above to use those sessions.</p>}
          </form>
        </ResultPanel>
      </div>
    </ToolLayout>
  );
}
