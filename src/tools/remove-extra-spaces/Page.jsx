import { useState } from 'react';
import { CaseSensitive, Eraser, Space } from 'lucide-react';
import * as content from './content.js';
import { buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import TextToolShell, { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { formatNumber } from '../../utils/formatResult.js';

export default function RemoveExtraSpacesPage() {
  const [text, setText] = useState('');
  const [trimLines, setTrimLines] = useState(true);
  const [removeBlank, setRemoveBlank] = useState(false);
  const options = { trimLines, removeBlank };
  const result = evaluate(text, options);

  return (
    <ToolLayout toolId="remove-extra-spaces" content={content}>
      <TextToolShell
        formLabel="Enter your text"
        onClear={() => setText('')}
        panel={{ title: 'Cleaned Text', icon: Space, emptyText: 'Type or paste your text to clean up its spacing.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-2">
                <ResultCard label="Characters Removed" value={formatNumber(result.removed)} icon={Eraser} />
                <ResultCard label="Characters Left" value={formatNumber(result.characters)} icon={CaseSensitive} tone="lavender" />
              </div>
              <TextOutput value={result.output} />
              <ResultActions getText={() => result.output} getReport={() => buildReport(result, options)} />
            </>
          )
        }
      >
        <TextField id="spaces-text" label="Your text" rows={10} value={text} onChange={setText} />
        <div>
          <CheckField label="Trim the start and end of lines" checked={trimLines} onChange={setTrimLines} />
          <CheckField label="Remove all blank lines" checked={removeBlank} onChange={setRemoveBlank} />
        </div>
      </TextToolShell>
    </ToolLayout>
  );
}
