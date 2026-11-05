import { useEffect, useRef, useState } from 'react';
import { FileJson, FileText, Minimize2, Percent } from 'lucide-react';
import * as content from './content.js';
import { TIMEOUT_MESSAGE, TIMEOUT_MS, buildReport, bytes, measure } from './logic.js';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { runInWorker } from '../../utils/runInWorker.js';

const createWorker = () => new Worker(new URL('./minifyWorker.js', import.meta.url), { type: 'module' });

export default function JavascriptMinifierPage() {
  const [code, setCode] = useState('');
  const [compress, setCompress] = useState(true);
  const [mangle, setMangle] = useState(true);
  const [error, setError] = useState();
  const [result, setResult] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const cancelRun = useRef(null);
  const form = useCalculatorForm();

  useEffect(() => () => cancelRun.current?.(), []);

  const submit = (event) => {
    event.preventDefault();
    cancelRun.current?.();
    if (!code.trim()) {
      setError('Please enter your JavaScript.');
      setResult(null);
      form.submit(event);
      return;
    }
    setIsRunning(true);
    cancelRun.current = runInWorker(
      createWorker,
      { code, compress, mangle },
      { timeoutMs: TIMEOUT_MS, timeoutMessage: TIMEOUT_MESSAGE, errorMessage: 'This code could not be minified. Please try again.' },
      ({ error: failure, output }) => {
        cancelRun.current = null;
        setIsRunning(false);
        setError(failure);
        setResult(failure ? null : { output, compress, mangle, ...measure(code, output) });
        form.submit(event);
      },
    );
  };

  const reset = () => {
    cancelRun.current?.();
    cancelRun.current = null;
    setIsRunning(false);
    setCode('');
    setCompress(true);
    setMangle(true);
    setError(undefined);
    setResult(null);
    form.clear();
  };

  return (
    <ToolLayout toolId="javascript-minifier" content={content}>
      <CalculatorShell
        form={{ ...form, submit }}
        formLabel="Enter your JavaScript"
        onReset={reset}
        submitLabel={isRunning ? 'Working…' : 'Minify'}
        panel={{ title: 'Minified JavaScript', icon: FileJson, emptyText: 'Paste your JavaScript and select Minify.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Saved" value={`${result.percent}%`} icon={Percent} />
                <ResultCard label="Minified Size" value={bytes(result.after)} icon={Minimize2} tone="yellow" />
                <ResultCard label="Original Size" value={bytes(result.before)} icon={FileText} tone="lavender" />
              </div>
              <TextOutput value={result.output} className="font-mono" />
              <ResultActions getText={() => result.output} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <TextField id="js-text" label="Your JavaScript" rows={12} value={code} onChange={setCode} error={error} className="font-mono" />
        <div>
          <CheckField label="Compress code" checked={compress} onChange={setCompress} />
          <CheckField label="Shorten variable names" checked={mangle} onChange={setMangle} />
        </div>
      </CalculatorShell>
    </ToolLayout>
  );
}
