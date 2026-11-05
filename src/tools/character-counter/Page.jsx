import { useState } from 'react';
import { CaseSensitive, Space, WholeWord } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, describeLimit, evaluate, getDetails } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TextToolShell, { TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { formatNumber } from '../../utils/formatResult.js';

export default function CharacterCounterPage() {
  const [text, setText] = useState('');
  const [limit, setLimit] = useState('');
  const { errors, result } = evaluate(text, limit);
  const limitNote = result && describeLimit(result);

  return (
    <ToolLayout toolId="character-counter" content={content}>
      <TextToolShell
        formLabel="Enter your text"
        onClear={() => {
          setText('');
          setLimit('');
        }}
        panel={{ title: 'Your Counts', icon: CaseSensitive, emptyText: 'Type or paste your text to see the character count.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Characters" value={formatNumber(result.characters)} icon={CaseSensitive} />
                <ResultCard label="Without Spaces" value={formatNumber(result.charactersNoSpaces)} icon={Space} tone="yellow" />
                <ResultCard label="Words" value={formatNumber(result.words)} icon={WholeWord} tone="lavender" />
              </div>
              {limitNote && <p className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${result.remaining < 0 ? 'bg-soft-yellow' : 'bg-secondary'}`}>{limitNote}</p>}
              <ResultDetails items={getDetails(result)} />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(text, result)} />
            </>
          )
        }
      >
        <TextField id="char-text" label="Your text" rows={10} value={text} onChange={setText} />
        <CalculatorInput id="char-limit" label="Character limit (optional)" inputMode="numeric" value={limit} onChange={setLimit} error={errors.limit} />
      </TextToolShell>
    </ToolLayout>
  );
}
