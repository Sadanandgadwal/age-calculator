import { useState } from 'react';
import { ListChecks, ListX, Rows3 } from 'lucide-react';
import * as content from './content.js';
import { buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import TextToolShell, { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { formatNumber } from '../../utils/formatResult.js';

export default function RemoveDuplicateLinesPage() {
  const [text, setText] = useState('');
  const [ignoreCase, setIgnoreCase] = useState(false);
  const [ignoreSpaces, setIgnoreSpaces] = useState(false);
  const [removeBlank, setRemoveBlank] = useState(false);
  const options = { ignoreCase, ignoreSpaces, removeBlank };
  const result = evaluate(text, options);

  return (
    <ToolLayout toolId="remove-duplicate-lines" content={content}>
      <TextToolShell
        formLabel="Enter your list"
        onClear={() => setText('')}
        panel={{ title: 'Cleaned List', icon: ListX, emptyText: 'Paste a list with one item on each line to remove the repeats.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Lines Kept" value={formatNumber(result.kept)} icon={ListChecks} />
                <ResultCard label="Lines Removed" value={formatNumber(result.removed)} icon={ListX} tone="yellow" />
                <ResultCard label="Original Lines" value={formatNumber(result.total)} icon={Rows3} tone="lavender" />
              </div>
              <TextOutput value={result.output} />
              <ResultActions getText={() => result.output} getReport={() => buildReport(result, options)} />
            </>
          )
        }
      >
        <TextField id="dedupe-text" label="Your list" rows={10} value={text} onChange={setText} />
        <div>
          <CheckField label="Ignore capital letters" checked={ignoreCase} onChange={setIgnoreCase} />
          <CheckField label="Ignore extra spaces" checked={ignoreSpaces} onChange={setIgnoreSpaces} />
          <CheckField label="Remove blank lines" checked={removeBlank} onChange={setRemoveBlank} />
        </div>
      </TextToolShell>
    </ToolLayout>
  );
}
