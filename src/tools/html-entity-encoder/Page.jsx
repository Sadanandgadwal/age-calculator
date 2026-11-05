import { useState } from 'react';
import { CodeXml } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function HtmlEntityEncoderPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [text, setText] = useState('');
  const [allNonAscii, setAllNonAscii] = useState(false);
  const output = evaluate(modeId, text, allNonAscii);

  return (
    <ToolLayout toolId="html-entity-encoder" content={content}>
      <TextToolShell
        formLabel="Enter your text"
        onClear={() => setText('')}
        panel={{ title: 'Result', icon: CodeXml, emptyText: 'Type or paste your text to convert it.' }}
        results={
          output !== null && (
            <>
              <TextOutput value={output} className="font-mono" />
              <ResultActions getText={() => output} getReport={() => buildReport(modeId, allNonAscii, output)} />
            </>
          )
        }
      >
        <SegmentedControl label="Action" options={MODES} value={modeId} onChange={setModeId} />
        <TextField id="entity-text" label={modeId === 'encode' ? 'Text to encode' : 'Text to decode'} rows={10} value={text} onChange={setText} />
        {modeId === 'encode' && <CheckField label="Encode all non-English characters" checked={allNonAscii} onChange={setAllNonAscii} />}
      </TextToolShell>
    </ToolLayout>
  );
}
