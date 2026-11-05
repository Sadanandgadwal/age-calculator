import { useState } from 'react';
import { Braces, CircleCheck, CircleX, FileCheck2, List } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, duplicateNote, evaluate, getDetails } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell, { TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { formatNumber } from '../../utils/formatResult.js';

export default function JsonValidatorPage() {
  const [text, setText] = useState('');
  const result = evaluate(text);
  const note = result?.valid && duplicateNote(result);

  return (
    <ToolLayout toolId="json-validator" content={content}>
      <TextToolShell
        formLabel="Enter your JSON"
        onClear={() => setText('')}
        panel={{ title: 'Validation Result', icon: FileCheck2, emptyText: 'Paste your JSON to check it.' }}
        results={
          result && (
            <>
              {result.valid ? (
                <>
                  <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                    <ResultCard label="Result" value="Valid JSON" icon={CircleCheck} />
                    <ResultCard label="Objects" value={formatNumber(result.stats.objects)} icon={Braces} tone="yellow" />
                    <ResultCard label="Arrays" value={formatNumber(result.stats.arrays)} icon={List} tone="lavender" />
                  </div>
                  {note && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{note}</p>}
                  <ResultDetails items={getDetails(result)} />
                </>
              ) : (
                <>
                  <div className="mt-5">
                    <ResultCard label="Result" value="Invalid JSON" icon={CircleX} tone="yellow" />
                  </div>
                  <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-semibold">{result.message}</p>
                  {result.detail && <p className="mt-2 text-sm break-words text-ink/80">{result.detail}</p>}
                </>
              )}
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <TextField id="json-validate-text" label="Your JSON" rows={12} value={text} onChange={setText} className="font-mono" />
      </TextToolShell>
    </ToolLayout>
  );
}
