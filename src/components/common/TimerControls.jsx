import { Pause, Play, RotateCcw } from 'lucide-react';
import { primaryTimerButton as primary, secondaryTimerButton as secondary } from './timerButtonClasses.js';

export default function TimerControls({ isRunning, hasStarted, onStart, onPause, onReset, startLabel = 'Start', disabled = false, children }) {
  return (
    <div className="flex flex-col gap-3 print:hidden">
      {isRunning ? (
        <button type="button" onClick={onPause} className={primary}>
          <Pause aria-hidden="true" className="size-5" />
          Pause
        </button>
      ) : (
        <button type="button" onClick={onStart} disabled={disabled} className={primary}>
          <Play aria-hidden="true" className="size-5" />
          {hasStarted ? 'Resume' : startLabel}
        </button>
      )}
      {children}
      <button type="button" onClick={onReset} className={secondary}>
        <RotateCcw aria-hidden="true" className="size-5" />
        Reset
      </button>
    </div>
  );
}
