import { useState } from 'react';
import { Clock, KeySquare, ShieldAlert, Tag } from 'lucide-react';
import * as content from './content.js';
import { NOT_VERIFIED, UNSIGNED_WARNING, buildResultText, decodeJwt } from './logic.js';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell, { TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function JwtDecoderPage() {
  const [token, setToken] = useState('');
  const [now, setNow] = useState(0);
  const { error, result } = decodeJwt(token, now);

  const change = (value) => {
    setNow(Date.now());
    setToken(value);
  };

  return (
    <ToolLayout toolId="jwt-decoder" content={content}>
      <TextToolShell
        formLabel="Enter your token"
        onClear={() => setToken('')}
        panel={{ title: 'Decoded Token', icon: KeySquare, emptyText: 'Paste a JWT to read what is inside it.' }}
        results={
          result && (
            <div className="print:hidden">
              <p role="note" className="mt-5 flex items-start gap-2 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-semibold">
                <ShieldAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
                {NOT_VERIFIED}
              </p>
              {result.isUnsigned && <p className="mt-3 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-semibold">{UNSIGNED_WARNING}</p>}
              <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3">
                <ResultCard label="Algorithm" value={result.algorithm} icon={Tag} />
                <ResultCard label="Time Status" value={result.status} icon={Clock} tone="lavender" />
              </div>
              {result.times.length > 0 && <ResultDetails items={result.times} />}
              <TextOutput label="Header" value={result.header} className="font-mono" />
              <TextOutput label="Payload" value={result.payload} className="font-mono" />
              <ResultActions copyOnly getText={() => buildResultText(result)} />
            </div>
          )
        }
      >
        <TextField id="jwt-token" label="Your token" rows={10} value={token} onChange={change} error={error} className="font-mono" />
      </TextToolShell>
    </ToolLayout>
  );
}
