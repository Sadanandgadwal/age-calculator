import { useState } from 'react';
import { Fingerprint } from 'lucide-react';
import * as content from './content.js';
import { VERSIONS, buildReport, generateUuids, validate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import { CheckField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

const DEFAULT_COUNT = '1';

export default function UuidGeneratorPage() {
  const [version, setVersion] = useState(VERSIONS[0].id);
  const [countText, setCountText] = useState(DEFAULT_COUNT);
  const [uppercase, setUppercase] = useState(false);
  const [noHyphens, setNoHyphens] = useState(false);
  const [error, setError] = useState();
  const [result, setResult] = useState(null);
  const form = useCalculatorForm();

  const submit = (event) => {
    const { error: nextError, count } = validate(countText);
    setError(nextError);
    setResult(nextError ? null : { uuids: generateUuids({ version, count, uppercase, noHyphens }), version, uppercase, noHyphens });
    form.submit(event);
  };

  const reset = () => {
    setVersion(VERSIONS[0].id);
    setCountText(DEFAULT_COUNT);
    setUppercase(false);
    setNoHyphens(false);
    setError(undefined);
    setResult(null);
    form.clear();
  };

  return (
    <ToolLayout toolId="uuid-generator" content={content}>
      <CalculatorShell
        form={{ ...form, submit }}
        formLabel="Choose your settings"
        onReset={reset}
        submitLabel="Generate"
        panel={{ title: 'Your UUIDs', icon: Fingerprint, emptyText: 'Choose your settings and select Generate.' }}
        results={
          result && (
            <>
              <TextOutput value={result.uuids.join('\n')} className="font-mono" />
              <ResultActions getText={() => result.uuids.join('\n')} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <SegmentedControl label="Version" options={VERSIONS} value={version} onChange={setVersion} />
        <CalculatorInput id="uuid-count" label="How many" inputMode="numeric" value={countText} onChange={setCountText} error={error} />
        <div>
          <CheckField label="Uppercase" checked={uppercase} onChange={setUppercase} />
          <CheckField label="Remove hyphens" checked={noHyphens} onChange={setNoHyphens} />
        </div>
      </CalculatorShell>
    </ToolLayout>
  );
}
