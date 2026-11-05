import { useEffect, useState } from 'react';
import { Hash, Regex } from 'lucide-react';
import * as content from './content.js';
import { FLAGS, buildReport, buildResultText, buildSegments, describeGroups, getCountLabel } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import TextToolShell, { CheckField, TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { runInWorker } from '../../utils/runInWorker.js';

const DELAY_MS = 200;
const MAX_LISTED = 100;
const createWorker = () => new Worker(new URL('./regexWorker.js', import.meta.url), { type: 'module' });

function Highlighted({ text, matches }) {
  return (
    <div className="mt-5">
      <h3 className="text-sm font-bold">Highlighted text</h3>
      <div tabIndex={0} role="region" aria-label="Highlighted text" className="mt-1 max-h-80 overflow-auto rounded-xl bg-page px-4 py-3 font-mono text-sm font-medium break-words whitespace-pre-wrap outline-none focus-visible:ring-3 focus-visible:ring-mint">
        {buildSegments(text, matches).map((segment, index) =>
          segment.isMatch ? (
            <mark key={index} className="rounded bg-soft-yellow font-bold text-ink outline outline-1 outline-amber-700">
              {segment.text}
            </mark>
          ) : (
            <span key={index}>{segment.text}</span>
          ),
        )}
      </div>
    </div>
  );
}

function MatchList({ matches }) {
  return (
    <div tabIndex={0} role="region" aria-label="Match list" className="mt-4 max-h-80 overflow-auto rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-mint">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-ink/80">
            <th scope="col" className="py-2 pr-3 font-semibold">#</th>
            <th scope="col" className="py-2 pr-3 font-semibold">Position</th>
            <th scope="col" className="py-2 pr-3 font-semibold">Match</th>
            <th scope="col" className="py-2 font-semibold">Groups</th>
          </tr>
        </thead>
        <tbody>
          {matches.slice(0, MAX_LISTED).map((match, index) => (
            <tr key={`${match.index}-${index}`} className="border-b border-line last:border-0">
              <td className="py-2 pr-3">{index + 1}</td>
              <td className="py-2 pr-3">{match.index}</td>
              <td className="py-2 pr-3 font-mono [overflow-wrap:anywhere]">{match.text || '(empty)'}</td>
              <td className="py-2 font-mono [overflow-wrap:anywhere]">{describeGroups(match) || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function RegexTesterPage() {
  const [pattern, setPattern] = useState('');
  const [enabled, setEnabled] = useState({ g: true, i: false, m: false, s: false, u: false });
  const [text, setText] = useState('');
  const [outcome, setOutcome] = useState(null);

  const flags = FLAGS.map(({ id }) => id).filter((id) => enabled[id]).join('');
  const key = JSON.stringify([pattern, flags, text]);

  useEffect(() => {
    if (!pattern || !text) return undefined;
    let cancel = null;
    const timer = setTimeout(() => {
      cancel = runInWorker(createWorker, { pattern, flags, text }, {}, (result) => setOutcome({ key, result }));
    }, DELAY_MS);
    return () => {
      clearTimeout(timer);
      cancel?.();
    };
  }, [pattern, flags, text, key]);

  const result = pattern && text && outcome?.key === key ? outcome.result : null;
  const request = { pattern, flags, text };

  const clear = () => {
    setPattern('');
    setText('');
  };

  return (
    <ToolLayout toolId="regex-tester" content={content}>
      <TextToolShell
        formLabel="Enter your pattern and test text"
        onClear={clear}
        panel={{ title: 'Matches', icon: Regex, emptyText: 'Enter a pattern and some text to see what it matches.' }}
        results={
          result?.matches && (
            <>
              <div className="mt-5">
                <ResultCard label={result.matches.length === 1 ? 'Match' : 'Matches'} value={getCountLabel(result)} icon={Hash} />
              </div>
              {result.truncated && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">Stopped at the first 1,000 matches.</p>}
              <Highlighted text={text} matches={result.matches} />
              {result.matches.length > 0 && <MatchList matches={result.matches} />}
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(request, result)} />
            </>
          )
        }
      >
        <CalculatorInput id="regex-pattern" inputMode="text" label="Pattern" value={pattern} onChange={setPattern} error={result?.error} placeholder="[a-z]+" className="font-mono" />
        <div>
          {FLAGS.map(({ id, label }) => (
            <CheckField key={id} label={label} checked={enabled[id]} onChange={(value) => setEnabled((current) => ({ ...current, [id]: value }))} />
          ))}
        </div>
        <TextField id="regex-text" label="Test text" rows={8} value={text} onChange={setText} className="font-mono" />
      </TextToolShell>
    </ToolLayout>
  );
}
