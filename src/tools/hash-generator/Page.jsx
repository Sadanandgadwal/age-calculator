import { useEffect, useState } from 'react';
import { Hash } from 'lucide-react';
import * as content from './content.js';
import { LEGACY_NOTE, applyCase, buildReport, buildResultText, computeHashes } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell, { CheckField, TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function HashGeneratorPage() {
  const [text, setText] = useState('');
  const [uppercase, setUppercase] = useState(false);
  const [outcome, setOutcome] = useState(null);

  useEffect(() => {
    if (!text) return undefined;
    let isCurrent = true;
    computeHashes(text)
      .then((hashes) => isCurrent && setOutcome({ text, hashes }))
      .catch(() => isCurrent && setOutcome({ text, error: 'Your browser only allows this on a secure (https) page.' }));
    return () => {
      isCurrent = false;
    };
  }, [text]);

  const current = text && outcome?.text === text ? outcome : null;
  const hashes = current?.hashes && applyCase(current.hashes, uppercase);

  return (
    <ToolLayout toolId="hash-generator" content={content}>
      <TextToolShell
        formLabel="Enter your text"
        onClear={() => setText('')}
        panel={{ title: 'Your Hashes', icon: Hash, emptyText: 'Type or paste your text to create its hashes.' }}
        results={
          hashes && (
            <>
              <div className="font-mono [&_dd]:text-sm [&_dd]:font-semibold [&_dd]:[overflow-wrap:anywhere]">
                <ResultDetails items={hashes} />
              </div>
              <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{LEGACY_NOTE}</p>
              <ResultActions getText={() => buildResultText(hashes)} getReport={() => buildReport(text, hashes)} />
            </>
          )
        }
      >
        <TextField id="hash-text" label="Your text" rows={10} value={text} onChange={setText} error={current?.error} />
        <CheckField label="Uppercase" checked={uppercase} onChange={setUppercase} />
      </TextToolShell>
    </ToolLayout>
  );
}
