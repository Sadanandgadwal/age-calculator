import { useState } from 'react';
import { FileText, Minimize2, Percent } from 'lucide-react';
import * as content from './content.js';
import { buildReport, bytes, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import TextToolShell, { TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function JsonMinifierPage() {
  const [text, setText] = useState('');
  const { error, result } = evaluate(text);

  return (
    <ToolLayout toolId="json-minifier" content={content}>
      <TextToolShell
        formLabel="Enter your JSON"
        onClear={() => setText('')}
        panel={{ title: 'Minified JSON', icon: Minimize2, emptyText: 'Paste your JSON to minify it.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Saved" value={`${result.percent}%`} icon={Percent} />
                <ResultCard label="Minified Size" value={bytes(result.after)} icon={Minimize2} tone="yellow" />
                <ResultCard label="Original Size" value={bytes(result.before)} icon={FileText} tone="lavender" />
              </div>
              <TextOutput value={result.output} className="font-mono" />
              <ResultActions getText={() => result.output} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <TextField id="json-minify-text" label="Your JSON" rows={12} value={text} onChange={setText} error={error} className="font-mono" />
      </TextToolShell>
    </ToolLayout>
  );
}
