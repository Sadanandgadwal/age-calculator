import { useState } from 'react';
import { Gauge, Keyboard, Target, TriangleAlert } from 'lucide-react';
import * as content from './content.js';
import { DURATIONS, PASSAGES, buildReport, buildResultText, buildSegments, formatAccuracy, getDetails, isFinished, scoreTyping } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import { secondaryTimerButton } from '../../components/common/timerButtonClasses.js';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useElapsedTimer } from '../../hooks/useElapsedTimer.js';
import { formatNumber } from '../../utils/formatResult.js';

const SEGMENT_CLASSES = {
  correct: 'text-primary',
  wrong: 'rounded bg-soft-yellow font-bold text-danger underline',
  current: 'rounded bg-mint',
  rest: 'text-ink/80',
};

export default function TypingSpeedTestPage() {
  const [durationId, setDurationId] = useState('60');
  const [passageIndex, setPassageIndex] = useState(0);
  const [typed, setTyped] = useState('');
  const [score, setScore] = useState(null);
  const passage = PASSAGES[passageIndex];
  const limitMs = DURATIONS.find(({ id }) => id === durationId).seconds * 1000;

  const timer = useElapsedTimer({
    limitMs,
    onLimit: () => setScore(scoreTyping(passage, typed, limitMs)),
  });

  const remaining = Math.ceil((limitMs - timer.elapsedMs) / 1000);

  const restart = (nextPassage = passageIndex) => {
    timer.reset();
    setTyped('');
    setScore(null);
    setPassageIndex(nextPassage);
  };

  const change = (value) => {
    if (score) return;
    if (!timer.isRunning) timer.start();
    setTyped(value);
    if (isFinished(passage, value)) {
      const elapsed = timer.read();
      timer.pause();
      setScore(scoreTyping(passage, value, elapsed));
    }
  };

  return (
    <ToolLayout toolId="typing-speed-test" content={content}>
      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-6 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section aria-label="Typing test" className="flex flex-col gap-5 rounded-3xl bg-card p-6 shadow-card sm:p-8">
          <SegmentedControl
            label="Test length"
            options={DURATIONS}
            value={durationId}
            onChange={(id) => {
              restart();
              setDurationId(id);
            }}
          />
          <p role="timer" className="text-center text-3xl font-extrabold tabular-nums">
            {score ? 'Finished' : `${remaining} s`}
          </p>
          <div data-testid="passage" tabIndex={0} role="region" aria-label="Text to type" className="max-h-52 overflow-auto rounded-xl bg-page px-4 py-3 text-lg leading-relaxed font-medium outline-none focus-visible:ring-3 focus-visible:ring-mint">
            {buildSegments(passage, typed).map((segment, index) => (
              <span key={index} className={SEGMENT_CLASSES[segment.kind]}>
                {segment.text}
              </span>
            ))}
          </div>
          <div>
            <label htmlFor="typing-input" className="block text-sm font-bold text-ink">
              Type here. The timer starts with your first key.
            </label>
            <textarea
              id="typing-input"
              rows={4}
              value={typed}
              disabled={Boolean(score)}
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck="false"
              onChange={(event) => change(event.target.value)}
              onPaste={(event) => event.preventDefault()}
              className="mt-2 block w-full resize-none rounded-2xl border-2 border-line bg-white px-4 py-3 text-base font-medium text-ink outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint disabled:cursor-not-allowed disabled:opacity-60"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 sm:gap-3">
            <button type="button" onClick={() => restart()} className={secondaryTimerButton}>
              Restart
            </button>
            <button type="button" onClick={() => restart((passageIndex + 1) % PASSAGES.length)} className={secondaryTimerButton}>
              New text
            </button>
          </div>
        </section>

        <ResultPanel title="Your Score" icon={Keyboard} emptyText="Finish the test to see your speed and accuracy.">
          {score ? (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3">
                <ResultCard label="Words per Minute" value={formatNumber(score.wpm)} icon={Gauge} />
                <div className="grid grid-cols-2 gap-2 sm:gap-3">
                  <ResultCard label="Accuracy" value={formatAccuracy(score.accuracy)} icon={Target} tone="yellow" />
                  <ResultCard label="Mistakes" value={formatNumber(score.errors)} icon={TriangleAlert} tone="lavender" />
                </div>
              </div>
              <ResultDetails items={getDetails(score)} />
              <ResultActions getText={() => buildResultText(score)} getReport={() => buildReport(score)} />
            </>
          ) : undefined}
        </ResultPanel>
      </div>
    </ToolLayout>
  );
}
