import { useState } from 'react';
import { CaseSensitive, Pilcrow, WholeWord } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, evaluate, getDetails } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell, { TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { formatNumber } from '../../utils/formatResult.js';

export default function WordCounterPage() {
  const [text, setText] = useState('');
  const result = evaluate(text);

  return (
    <ToolLayout toolId="word-counter" content={content}>
      <TextToolShell
        formLabel="Enter your text"
        onClear={() => setText('')}
        panel={{ title: 'Your Counts', icon: WholeWord, emptyText: 'Type or paste your text to see the counts update as you go.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Words" value={formatNumber(result.words)} icon={WholeWord} />
                <ResultCard label="Characters" value={formatNumber(result.characters)} icon={CaseSensitive} tone="yellow" />
                <ResultCard label="Sentences" value={formatNumber(result.sentences)} icon={Pilcrow} tone="lavender" />
              </div>
              <ResultDetails items={getDetails(result)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(text, result)} />
            </>
          )
        }
      >
        <TextField id="word-text" label="Your text" rows={10} value={text} onChange={setText} />
      </TextToolShell>
    </ToolLayout>
  );
}
