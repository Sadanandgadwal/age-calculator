import { useState } from 'react';
import { Binary } from 'lucide-react';
import * as content from './content.js';
import { MODES, buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function Base64Page() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [text, setText] = useState('');
  const [urlSafe, setUrlSafe] = useState(false);
  const { error, output } = evaluate(modeId, text, urlSafe);

  return (
    <ToolLayout toolId="base64-encoder-decoder" content={content}>
      <TextToolShell
        formLabel="Enter your text"
        onClear={() => setText('')}
        panel={{ title: 'Result', icon: Binary, emptyText: 'Type or paste your text to convert it.' }}
        results={
          output !== null && (
            <>
              <TextOutput value={output} className="font-mono" />
              <ResultActions getText={() => output} getReport={() => buildReport(modeId, urlSafe, output)} />
            </>
          )
        }
      >
        <SegmentedControl label="Action" options={MODES} value={modeId} onChange={setModeId} />
        <TextField id="base64-text" label={modeId === 'encode' ? 'Text to encode' : 'Base64 to decode'} rows={10} value={text} onChange={setText} error={error} />
        {modeId === 'encode' && <CheckField label="URL-safe (no + or /, and no padding)" checked={urlSafe} onChange={setUrlSafe} />}
      </TextToolShell>
    </ToolLayout>
  );
}
