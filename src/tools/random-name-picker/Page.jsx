import { useState } from 'react';
import { Trophy, UserRoundCheck, Users } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, pickNames, validate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import { CheckField, TextField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { formatNumber } from '../../utils/formatResult.js';

const DEFAULT_COUNT = '1';

export default function RandomNamePickerPage() {
  const [text, setText] = useState('');
  const [countText, setCountText] = useState(DEFAULT_COUNT);
  const [mergeRepeats, setMergeRepeats] = useState(true);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const form = useCalculatorForm();

  const submit = (event) => {
    const { errors: nextErrors, names, count } = validate({ text, countText, mergeRepeats });
    const isValid = Object.keys(nextErrors).length === 0;
    setErrors(nextErrors);
    setResult(isValid ? { winners: pickNames(names, count), total: names.length } : null);
    form.submit(event);
  };

  const reset = () => {
    setText('');
    setCountText(DEFAULT_COUNT);
    setMergeRepeats(true);
    setErrors({});
    setResult(null);
    form.clear();
  };

  return (
    <ToolLayout toolId="random-name-picker" content={content}>
      <CalculatorShell
        form={{ ...form, submit }}
        formLabel="Enter your names"
        onReset={reset}
        submitLabel="Pick"
        panel={{ title: 'Your Pick', icon: UserRoundCheck, emptyText: 'Enter your names and select Pick.' }}
        results={
          result && (
            <>
              <p aria-live="polite" className="sr-only">
                Picked {result.winners.join(', ')}
              </p>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-2">
                {result.winners.length === 1 ? (
                  <ResultCard label="Winner" value={result.winners[0]} icon={Trophy} />
                ) : (
                  <ResultCard label="Winners Picked" value={formatNumber(result.winners.length)} icon={Trophy} />
                )}
                <ResultCard label="Names in the List" value={formatNumber(result.total)} icon={Users} tone="lavender" />
              </div>
              {result.winners.length > 1 && <TextOutput label="Winners" value={result.winners.join('\n')} />}
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <TextField id="names-text" label="Names, one on each line" rows={10} value={text} onChange={setText} error={errors.text} />
        <CalculatorInput id="names-count" label="How many to pick" inputMode="numeric" value={countText} onChange={setCountText} error={errors.count} />
        <CheckField label="Count repeated names once" checked={mergeRepeats} onChange={setMergeRepeats} />
      </CalculatorShell>
    </ToolLayout>
  );
}
