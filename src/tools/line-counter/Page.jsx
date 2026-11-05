import { useState } from 'react';
import { AlignJustify, ListOrdered, Rows2 } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, evaluate, getDetails } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell, { TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { formatNumber } from '../../utils/formatResult.js';

export default function LineCounterPage() {
  const [text, setText] = useState('');
  const result = evaluate(text);

  return (
    <ToolLayout toolId="line-counter" content={content}>
      <TextToolShell
        formLabel="Enter your text"
        onClear={() => setText('')}
        panel={{ title: 'Your Lines', icon: ListOrdered, emptyText: 'Type or paste your text to count its lines.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Total Lines" value={formatNumber(result.lines)} icon={ListOrdered} />
                <ResultCard label="Non-Empty Lines" value={formatNumber(result.nonEmpty)} icon={AlignJustify} tone="yellow" />
                <ResultCard label="Blank Lines" value={formatNumber(result.blank)} icon={Rows2} tone="lavender" />
              </div>
              <ResultDetails items={getDetails(result)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(text, result)} />
            </>
          )
        }
      >
        <TextField id="line-text" label="Your text" rows={12} value={text} onChange={setText} />
      </TextToolShell>
    </ToolLayout>
  );
}
