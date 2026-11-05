import { useState } from 'react';
import { Link } from 'lucide-react';
import * as content from './content.js';
import { MODES, SCOPES, buildReport, evaluate } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function UrlEncoderDecoderPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [scopeId, setScopeId] = useState(SCOPES[0].id);
  const [text, setText] = useState('');
  const [plusAsSpace, setPlusAsSpace] = useState(false);
  const settings = { modeId, scopeId, text, plusAsSpace };
  const { error, output } = evaluate(settings);

  return (
    <ToolLayout toolId="url-encoder-decoder" content={content}>
      <TextToolShell
        formLabel="Enter your text"
        onClear={() => setText('')}
        panel={{ title: 'Result', icon: Link, emptyText: 'Type or paste your text to convert it.' }}
        results={
          output !== null && (
            <>
              <TextOutput value={output} className="font-mono" />
              <ResultActions getText={() => output} getReport={() => buildReport(settings, output)} />
            </>
          )
        }
      >
        <SegmentedControl label="Action" options={MODES} value={modeId} onChange={setModeId} />
        <SegmentedControl label="Applies to" options={SCOPES} value={scopeId} onChange={setScopeId} />
        <TextField id="url-text" label={modeId === 'encode' ? 'Text to encode' : 'Text to decode'} rows={8} value={text} onChange={setText} error={error} />
        {modeId === 'decode' && <CheckField label="Treat plus signs as spaces (form data)" checked={plusAsSpace} onChange={setPlusAsSpace} />}
      </TextToolShell>
    </ToolLayout>
  );
}
