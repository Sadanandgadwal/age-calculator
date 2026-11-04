import { useState } from 'react';
import { CaseUpper } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function CaseConverterPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [text, setText] = useState('');
  const output = evaluate(modeId, text);

  return (
    <ToolLayout toolId="case-converter" content={content}>
      <div className="mb-6">
        <SegmentedControl label="Case" options={MODES} value={modeId} onChange={setModeId} />
      </div>
      <TextToolShell
        formLabel="Enter your text"
        onClear={() => setText('')}
        panel={{ title: 'Converted Text', icon: CaseUpper, emptyText: 'Type or paste your text, then choose a case above.' }}
        results={
          output !== null && (
            <>
              <TextOutput value={output} />
              <ResultActions getText={() => output} getReport={() => buildReport(modeId, output)} />
            </>
          )
        }
      >
        <TextField id="case-text" label="Your text" rows={10} value={text} onChange={setText} />
      </TextToolShell>
    </ToolLayout>
  );
}
