import { useState } from 'react';
import { FileType } from 'lucide-react';
import * as content from './content.js';
import { INDENTS, buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function HtmlFormatterPage() {
  const [text, setText] = useState('');
  const [indentId, setIndentId] = useState(INDENTS[0].id);
  const { error, output } = evaluate(text, indentId);

  return (
    <ToolLayout toolId="html-formatter" content={content}>
      <TextToolShell
        formLabel="Enter your HTML"
        onClear={() => setText('')}
        panel={{ title: 'Formatted HTML', icon: FileType, emptyText: 'Paste your HTML to tidy it.' }}
        results={
          output !== null && (
            <>
              <TextOutput value={output} className="font-mono" />
              <ResultActions getText={() => output} getReport={() => buildReport(output, indentId)} />
            </>
          )
        }
      >
        <TextField id="html-text" label="Your HTML" rows={12} value={text} onChange={setText} error={error} className="font-mono" />
        <SegmentedControl label="Indent" options={INDENTS} value={indentId} onChange={setIndentId} />
      </TextToolShell>
    </ToolLayout>
  );
}
