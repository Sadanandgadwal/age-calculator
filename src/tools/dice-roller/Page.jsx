import { useState } from 'react';
import { Dice5, Sigma } from 'lucide-react';
import * as content from './content.js';
import { DICE, buildReport, buildResultText, describeRolls, getDetails, rollDice, validate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import { TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { formatNumber } from '../../utils/formatResult.js';

const DEFAULT_DIE = '6';
const DEFAULT_COUNT = '1';

export default function DiceRollerPage() {
  const [dieId, setDieId] = useState(DEFAULT_DIE);
  const [countText, setCountText] = useState(DEFAULT_COUNT);
  const [error, setError] = useState();
  const [result, setResult] = useState(null);
  const form = useCalculatorForm();

  const submit = (event) => {
    const { value, error: nextError } = validate(countText);
    setError(nextError);
    setResult(nextError ? null : rollDice(value, Number(dieId)));
    form.submit(event);
  };

  const reset = () => {
    setDieId(DEFAULT_DIE);
    setCountText(DEFAULT_COUNT);
    setError(undefined);
    setResult(null);
    form.clear();
  };

  return (
    <ToolLayout toolId="dice-roller" content={content}>
      <CalculatorShell
        form={{ ...form, submit }}
        formLabel="Choose your dice"
        onReset={reset}
        submitLabel="Roll"
        panel={{ title: 'Your Roll', icon: Dice5, emptyText: 'Choose your dice and select Roll.' }}
        results={
          result && (
            <>
              <p aria-live="polite" className="sr-only">
                Total {result.total}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
                <ResultCard label="Total" value={formatNumber(result.total)} icon={Sigma} />
                <ResultCard label="Dice" value={`${result.rolls.length}d${result.sides}`} icon={Dice5} tone="lavender" />
              </div>
              <ResultDetails items={getDetails(result)} />
              <TextOutput label="Every roll" value={describeRolls(result)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <SegmentedControl label="Type of die" options={DICE} value={dieId} onChange={setDieId} />
        <CalculatorInput id="dice-count" label="Number of dice" inputMode="numeric" value={countText} onChange={setCountText} error={error} />
      </CalculatorShell>
    </ToolLayout>
  );
}
