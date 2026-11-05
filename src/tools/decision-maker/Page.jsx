import { useState } from 'react';
import { Percent, Signpost } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, formatChance, pickOption, readOptions } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import { TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

export default function DecisionMakerPage() {
  const [question, setQuestion] = useState('');
  const [text, setText] = useState('');
  const [error, setError] = useState();
  const [result, setResult] = useState(null);
  const form = useCalculatorForm();

  const submit = (event) => {
    const { error: nextError, options } = readOptions(text);
    setError(nextError);
    setResult(nextError ? null : { ...pickOption(options), question: question.trim() });
    form.submit(event);
  };

  const reset = () => {
    setQuestion('');
    setText('');
    setError(undefined);
    setResult(null);
    form.clear();
  };

  return (
    <ToolLayout toolId="decision-maker" content={content}>
      <CalculatorShell
        form={{ ...form, submit }}
        formLabel="Enter your options"
        onReset={reset}
        submitLabel="Decide"
        panel={{ title: 'Your Decision', icon: Signpost, emptyText: 'Enter at least two options and select Decide.' }}
        results={
          result && (
            <>
              <p aria-live="polite" className="sr-only">
                Decision: {result.winner}
              </p>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-2">
                <ResultCard label="Decision" value={result.winner} icon={Signpost} />
                <ResultCard label="Its Chance" value={formatChance(result.winnerChance)} icon={Percent} tone="lavender" />
              </div>
              <ResultDetails items={result.options.map(({ name, chance }) => ({ label: name, value: formatChance(chance) }))} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="decide-question" inputMode="text" label="Your question (optional)" value={question} onChange={setQuestion} />
        <TextField id="decide-options" label="Options, one on each line" rows={8} value={text} onChange={setText} error={error} />
        <p className="text-sm text-ink/80">To favour an option, add | and a weight, such as Pizza | 3.</p>
      </CalculatorShell>
    </ToolLayout>
  );
}
