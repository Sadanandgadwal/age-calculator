import { useState } from 'react';
import { Braces } from 'lucide-react';
import * as content from './content.js';
import { INDENTS, buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function JsonFormatterPage() {
  const [text, setText] = useState('');
  const [indentId, setIndentId] = useState(INDENTS[0].id);
  const [sortKeys, setSortKeys] = useState(false);
  const { error, output } = evaluate(text, indentId, sortKeys);

  return (
    <ToolLayout toolId="json-formatter" content={content}>
      <TextToolShell
        formLabel="Enter your JSON"
        onClear={() => setText('')}
        panel={{ title: 'Formatted JSON', icon: Braces, emptyText: 'Paste your JSON to format it.' }}
        results={
          output !== null && (
            <>
              <TextOutput value={output} className="font-mono" />
              <ResultActions getText={() => output} getReport={() => buildReport(output, indentId, sortKeys)} />
            </>
          )
        }
      >
        <TextField id="json-format-text" label="Your JSON" rows={12} value={text} onChange={setText} error={error} className="font-mono" />
        <SegmentedControl label="Indent" options={INDENTS} value={indentId} onChange={setIndentId} />
        <CheckField label="Sort keys alphabetically" checked={sortKeys} onChange={setSortKeys} />
      </TextToolShell>
    </ToolLayout>
  );
}
