import { useState } from 'react';
import { Flag, ListOrdered, Trash2 } from 'lucide-react';
import * as content from './content.js';
import { addLap, buildResultText, formatStopwatch } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import { secondaryTimerButton } from '../../components/common/timerButtonClasses.js';
import TimerControls from '../../components/common/TimerControls.jsx';
import TimerDisplay from '../../components/common/TimerDisplay.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useElapsedTimer } from '../../hooks/useElapsedTimer.js';

const preciseClock = () => performance.now();

function LapTable({ laps }) {
  return (
    <table className="mt-4 w-full text-right text-sm">
      <caption className="sr-only">Lap times, newest first</caption>
      <thead>
        <tr className="border-b border-line text-ink/80">
          <th scope="col" className="py-2 pr-3 text-left font-semibold">Lap</th>
          <th scope="col" className="py-2 pr-3 font-semibold">Lap time</th>
          <th scope="col" className="py-2 font-semibold">Total</th>
        </tr>
      </thead>
      <tbody className="tabular-nums">
        {laps.map(({ number, lapMs, totalMs }) => (
          <tr key={number} className="border-b border-line last:border-0">
            <th scope="row" className="py-2 pr-3 text-left font-semibold">{number}</th>
            <td className="py-2 pr-3 font-bold">{formatStopwatch(lapMs)}</td>
            <td className="py-2">{formatStopwatch(totalMs)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default function StopwatchPage() {
  const timer = useElapsedTimer({ clock: preciseClock, tickMs: 50 });
  const [laps, setLaps] = useState([]);

  const reset = () => {
    timer.reset();
    setLaps([]);
  };

  return (
    <ToolLayout toolId="stopwatch" content={content}>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <section data-print-keep aria-label="Stopwatch" className="flex flex-col gap-5 rounded-3xl bg-card p-6 shadow-card sm:p-8">
          <TimerDisplay value={formatStopwatch(timer.elapsedMs)} label="Elapsed time" />
          <TimerControls isRunning={timer.isRunning} hasStarted={timer.hasStarted} onStart={timer.start} onPause={timer.pause} onReset={reset}>
            <button type="button" disabled={!timer.isRunning} onClick={() => setLaps((current) => addLap(current, timer.read()))} className={secondaryTimerButton}>
              <Flag aria-hidden="true" className="size-5" />
              Lap
            </button>
          </TimerControls>
          {timer.hasStarted && <ResultActions getText={() => buildResultText(timer.read(), laps)} />}
        </section>

        <ResultPanel title="Lap Times" icon={ListOrdered} emptyText="Select Lap while the stopwatch is running to record lap times.">
          {laps.length > 0 ? (
            <>
              <LapTable laps={laps} />
              <button type="button" onClick={() => setLaps([])} className={`${secondaryTimerButton} mt-4 w-full print:hidden`}>
                <Trash2 aria-hidden="true" className="size-5" />
                Clear laps
              </button>
            </>
          ) : undefined}
        </ResultPanel>
      </div>
    </ToolLayout>
  );
}
