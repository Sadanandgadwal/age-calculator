import { useState } from 'react';
import { Database } from 'lucide-react';
import * as content from './content.js';
import { DIALECTS, buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function SqlFormatterPage() {
  const [text, setText] = useState('');
  const [dialectId, setDialectId] = useState(DIALECTS[0].id);
  const [uppercase, setUppercase] = useState(true);
  const { error, output } = evaluate(text, dialectId, uppercase);

  return (
    <ToolLayout toolId="sql-formatter" content={content}>
      <TextToolShell
        formLabel="Enter your SQL"
        onClear={() => setText('')}
        panel={{ title: 'Formatted SQL', icon: Database, emptyText: 'Paste your SQL to format it.' }}
        results={
          output !== null && (
            <>
              <TextOutput value={output} className="font-mono" />
              <ResultActions getText={() => output} getReport={() => buildReport(output, dialectId, uppercase)} />
            </>
          )
        }
      >
        <TextField id="sql-text" label="Your SQL" rows={12} value={text} onChange={setText} error={error} className="font-mono" />
        <SegmentedControl label="Dialect" options={DIALECTS} value={dialectId} onChange={setDialectId} />
        <CheckField label="Uppercase keywords" checked={uppercase} onChange={setUppercase} />
      </TextToolShell>
    </ToolLayout>
  );
}
