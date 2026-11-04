import { useState } from 'react';
import { ArrowDownAZ, Shuffle } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, getMode, readLines, sortLines } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { shuffle } from '../../utils/secureRandom.js';

const shuffleButton =
  'inline-flex min-h-12 cursor-pointer items-center justify-center gap-3 rounded-2xl border-2 border-line bg-white px-5 font-bold text-primary transition-colors outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2';

export default function TextSorterPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [text, setText] = useState('');
  const [removeBlank, setRemoveBlank] = useState(true);
  const [shuffled, setShuffled] = useState(null);

  const lines = text.trim() ? readLines(text, removeBlank) : null;
  const output = shuffled ?? (lines && sortLines(lines, modeId));
  const order = shuffled ? 'Shuffled' : getMode(modeId).name;

  const change = (setter) => (value) => {
    setShuffled(null);
    setter(value);
  };

  return (
    <ToolLayout toolId="text-sorter" content={content}>
      <TextToolShell
        formLabel="Enter your lines"
        onClear={() => change(setText)('')}
        panel={{ title: 'Sorted Lines', icon: ArrowDownAZ, emptyText: 'Paste a list with one item on each line to sort it.' }}
        results={
          output && (
            <>
              <TextOutput value={output.join('\n')} />
              <ResultActions getText={() => output.join('\n')} getReport={() => buildReport(order, output)} />
            </>
          )
        }
      >
        <SegmentedControl label="Sort order" options={MODES} value={modeId} onChange={change(setModeId)} />
        <TextField id="sort-text" label="Your lines" rows={10} value={text} onChange={change(setText)} />
        <CheckField label="Remove blank lines" checked={removeBlank} onChange={change(setRemoveBlank)} />
        <button type="button" disabled={!lines} onClick={() => setShuffled(shuffle(lines))} className={`${shuffleButton} disabled:cursor-not-allowed disabled:opacity-50`}>
          <Shuffle aria-hidden="true" className="size-5" />
          Shuffle lines
        </button>
      </TextToolShell>
    </ToolLayout>
  );
}
