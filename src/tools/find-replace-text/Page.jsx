import { useEffect, useRef, useState } from 'react';
import { Hash, Replace } from 'lucide-react';
import * as content from './content.js';
import { REGEX_TIMEOUT_MS, TIMEOUT_MESSAGE, buildReport, buildResultText, replaceText, validate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { formatNumber } from '../../utils/formatResult.js';

function runInWorker(request, onDone) {
  const worker = new Worker(new URL('./regexWorker.js', import.meta.url), { type: 'module' });
  const finish = (outcome) => {
    clearTimeout(timer);
    worker.terminate();
    onDone(outcome);
  };
  const timer = setTimeout(() => finish({ error: TIMEOUT_MESSAGE }), REGEX_TIMEOUT_MS);
  worker.onmessage = ({ data }) => finish(data);
  worker.onerror = () => finish({ error: 'This pattern could not be run. Please try a different one.' });
  worker.postMessage(request);
  return () => {
    clearTimeout(timer);
    worker.terminate();
  };
}

export default function FindReplaceTextPage() {
  const [text, setText] = useState('');
  const [find, setFind] = useState('');
  const [replacement, setReplacement] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [errors, setErrors] = useState({});
  const [outcome, setOutcome] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const cancelRun = useRef(null);
  const form = useCalculatorForm();

  useEffect(() => () => cancelRun.current?.(), []);

  const finish = (event, request, { error, output, count }) => {
    cancelRun.current = null;
    setIsRunning(false);
    setErrors(error ? { find: error } : {});
    setOutcome(error ? null : { output, count, request });
    form.submit(event);
  };

  const submit = (event) => {
    event.preventDefault();
    cancelRun.current?.();
    const request = { text, find, replacement, caseSensitive, wholeWord, useRegex };
    const nextErrors = validate(request);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setOutcome(null);
      form.submit(event);
      return;
    }
    if (!useRegex) {
      finish(event, request, replaceText(request));
      return;
    }
    setIsRunning(true);
    cancelRun.current = runInWorker(request, (result) => finish(event, request, result));
  };

  const reset = () => {
    cancelRun.current?.();
    cancelRun.current = null;
    setIsRunning(false);
    setText('');
    setFind('');
    setReplacement('');
    setCaseSensitive(false);
    setWholeWord(false);
    setUseRegex(false);
    setErrors({});
    setOutcome(null);
    form.clear();
  };

  return (
    <ToolLayout toolId="find-replace-text" content={content}>
      <CalculatorShell
        form={{ ...form, submit }}
        formLabel="Enter your text and what to replace"
        onReset={reset}
        submitLabel={isRunning ? 'Working…' : 'Replace all'}
        panel={{ title: 'Updated Text', icon: Replace, emptyText: 'Enter your text and what to find, then select Replace all.' }}
        results={
          outcome && (
            <>
              <div className="mt-5">
                <ResultCard label={outcome.count === 1 ? 'Replacement Made' : 'Replacements Made'} value={formatNumber(outcome.count)} icon={Hash} />
              </div>
              {outcome.count === 0 && <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">No matches were found, so your text has not changed.</p>}
              <TextOutput value={outcome.output} />
              <ResultActions getText={() => buildResultText(outcome)} getReport={() => buildReport(outcome, outcome.request)} />
            </>
          )
        }
      >
        <TextField id="replace-text" label="Your text" rows={8} value={text} onChange={setText} error={errors.text} />
        <CalculatorInput id="replace-find" inputMode="text" label="Find" value={find} onChange={setFind} error={errors.find} />
        <CalculatorInput id="replace-with" inputMode="text" label="Replace with" value={replacement} onChange={setReplacement} />
        <div>
          <CheckField label="Match case" checked={caseSensitive} onChange={setCaseSensitive} />
          <CheckField label="Whole words only" checked={wholeWord} onChange={setWholeWord} />
          <CheckField label="Use a regular expression" checked={useRegex} onChange={setUseRegex} />
        </div>
      </CalculatorShell>
    </ToolLayout>
  );
}
