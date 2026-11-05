import { useState } from 'react';
import { Coins, Crown, Hash } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, describeSequence, flipCoins, getDetails, validate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import { TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';
import { formatNumber } from '../../utils/formatResult.js';

const DEFAULT_COUNT = '1';

export default function CoinFlipPage() {
  const [countText, setCountText] = useState(DEFAULT_COUNT);
  const [error, setError] = useState();
  const [result, setResult] = useState(null);
  const form = useCalculatorForm();

  const submit = (event) => {
    const { value, error: nextError } = validate(countText);
    setError(nextError);
    setResult(nextError ? null : flipCoins(value));
    form.submit(event);
  };

  const reset = () => {
    setCountText(DEFAULT_COUNT);
    setError(undefined);
    setResult(null);
    form.clear();
  };

  return (
    <ToolLayout toolId="coin-flip" content={content}>
      <CalculatorShell
        form={{ ...form, submit }}
        formLabel="Choose how many flips"
        onReset={reset}
        submitLabel="Flip"
        panel={{ title: 'Your Flip', icon: Coins, emptyText: 'Select Flip to toss the coin.' }}
        results={
          result && (
            <>
              <p aria-live="polite" className="sr-only">
                {buildResultText(result).split('\n')[0]}
              </p>
              {result.flips.length === 1 ? (
                <div className="mt-5">
                  <ResultCard label="Result" value={result.flips[0]} icon={Coins} />
                </div>
              ) : (
                <>
                  <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-3">
                    <ResultCard label="Heads" value={formatNumber(result.heads)} icon={Crown} />
                    <ResultCard label="Tails" value={formatNumber(result.tails)} icon={Coins} tone="yellow" />
                    <ResultCard label="Flips" value={formatNumber(result.flips.length)} icon={Hash} tone="lavender" />
                  </div>
                  <ResultDetails items={getDetails(result)} />
                  <TextOutput label="Every flip" value={describeSequence(result)} />
                </>
              )}
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id="coin-count" label="Number of flips" inputMode="numeric" value={countText} onChange={setCountText} error={error} />
      </CalculatorShell>
    </ToolLayout>
  );
}
