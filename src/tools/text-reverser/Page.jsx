import { useState } from 'react';
import { Undo2 } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function TextReverserPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [text, setText] = useState('');
  const output = evaluate(modeId, text);

  return (
    <ToolLayout toolId="text-reverser" content={content}>
      <TextToolShell
        formLabel="Enter your text"
        onClear={() => setText('')}
        panel={{ title: 'Reversed Text', icon: Undo2, emptyText: 'Type or paste your text to reverse it.' }}
        results={
          output !== null && (
            <>
              <TextOutput value={output} />
              <ResultActions getText={() => output} getReport={() => buildReport(modeId, text, output)} />
            </>
          )
        }
      >
        <SegmentedControl label="Reverse by" options={MODES} value={modeId} onChange={setModeId} />
        <TextField id="reverse-text" label="Your text" rows={10} value={text} onChange={setText} />
      </TextToolShell>
    </ToolLayout>
  );
}
