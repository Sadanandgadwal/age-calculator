import { useState } from 'react';
import { Dices } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, describeNumbers, generateNumbers, validate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import { CheckField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { formatNumber } from '../../utils/formatResult.js';

const DEFAULTS = { min: '1', max: '100', count: '1' };

export default function RandomNumberGeneratorPage() {
  const [fields, setFields] = useState(DEFAULTS);
  const [unique, setUnique] = useState(false);
  const [sorted, setSorted] = useState(false);
  const [errors, setErrors] = useState({});
  const [result, setResult] = useState(null);
  const form = useCalculatorForm();

  const set = (name) => (value) => setFields((current) => ({ ...current, [name]: value }));

  const submit = (event) => {
    const { errors: nextErrors, values } = validate({ ...fields, unique });
    setErrors(nextErrors);
    setResult(values ? { numbers: generateNumbers({ ...values, unique, sorted }), min: values.min, max: values.max, unique, sorted } : null);
    form.submit(event);
  };

  const reset = () => {
    setFields(DEFAULTS);
    setUnique(false);
    setSorted(false);
    setErrors({});
    setResult(null);
    form.clear();
  };

  return (
    <ToolLayout toolId="random-number-generator" content={content}>
      <CalculatorShell
        form={{ ...form, submit }}
        formLabel="Choose your range"
        onReset={reset}
        submitLabel="Generate"
        panel={{ title: 'Your Numbers', icon: Dices, emptyText: 'Choose a range and select Generate to pick your numbers.' }}
        results={
          result && (
            <>
              <div className="mt-5">
                {result.numbers.length === 1 ? (
                  <ResultCard label="Random Number" value={String(result.numbers[0])} icon={Dices} />
                ) : (
                  <ResultCard label="Numbers Picked" value={formatNumber(result.numbers.length)} icon={Dices} />
                )}
              </div>
              {result.numbers.length > 1 && <TextOutput value={describeNumbers(result.numbers)} />}
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="random-min" label="Lowest number" value={fields.min} onChange={set('min')} error={errors.min} />
        <CalculatorInput id="random-max" label="Highest number" value={fields.max} onChange={set('max')} error={errors.max} />
        <CalculatorInput id="random-count" label="How many numbers" inputMode="numeric" value={fields.count} onChange={set('count')} error={errors.count} />
        <div>
          <CheckField label="No repeats" checked={unique} onChange={setUnique} />
          <CheckField label="Sort the results" checked={sorted} onChange={setSorted} />
        </div>
      </CalculatorShell>
    </ToolLayout>
  );
}
