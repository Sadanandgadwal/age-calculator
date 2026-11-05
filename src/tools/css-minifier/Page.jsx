import { useState } from 'react';
import { FileText, Minimize2, Paintbrush, Percent } from 'lucide-react';
import * as content from './content.js';
import { buildReport, bytes, describeProblems, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import TextToolShell, { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function CssMinifierPage() {
  const [text, setText] = useState('');
  const [restructure, setRestructure] = useState(true);
  const { error, result } = evaluate(text, restructure);
  const note = result && describeProblems(result);

  return (
    <ToolLayout toolId="css-minifier" content={content}>
      <TextToolShell
        formLabel="Enter your CSS"
        onClear={() => setText('')}
        panel={{ title: 'Minified CSS', icon: Paintbrush, emptyText: 'Paste your CSS to minify it.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Saved" value={`${result.percent}%`} icon={Percent} />
                <ResultCard label="Minified Size" value={bytes(result.after)} icon={Minimize2} tone="yellow" />
                <ResultCard label="Original Size" value={bytes(result.before)} icon={FileText} tone="lavender" />
              </div>
              {note && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{note}</p>}
              <TextOutput value={result.output} className="font-mono" />
              <ResultActions getText={() => result.output} getReport={() => buildReport(result, restructure)} />
            </>
          )
        }
      >
        <TextField id="css-text" label="Your CSS" rows={12} value={text} onChange={setText} error={error} className="font-mono" />
        <CheckField label="Merge matching rules for a smaller result" checked={restructure} onChange={setRestructure} />
      </TextToolShell>
    </ToolLayout>
  );
}
