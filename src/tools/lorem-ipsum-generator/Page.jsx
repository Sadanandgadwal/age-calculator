import { useState } from 'react';
import { CaseSensitive, Pilcrow, WholeWord } from 'lucide-react';
import * as content from './content.js';
import { UNITS, buildReport, evaluate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell, { CheckField, TextOutput } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { formatNumber } from '../../utils/formatResult.js';

const DEFAULT_COUNT = '3';

export default function LoremIpsumGeneratorPage() {
  const [unitId, setUnitId] = useState(UNITS[0].id);
  const [countText, setCountText] = useState(DEFAULT_COUNT);
  const [classic, setClassic] = useState(true);
  const { errors, result } = evaluate({ unitId, countText, classic });

  const clear = () => {
    setUnitId(UNITS[0].id);
    setCountText(DEFAULT_COUNT);
    setClassic(true);
  };

  return (
    <ToolLayout toolId="lorem-ipsum-generator" content={content}>
      <TextToolShell
        formLabel="Choose how much text you need"
        onClear={clear}
        panel={{ title: 'Placeholder Text', icon: Pilcrow, emptyText: 'Enter how much text you need.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid grid-cols-2 gap-2 sm:gap-3">
                <ResultCard label="Words" value={formatNumber(result.words)} icon={WholeWord} />
                <ResultCard label="Characters" value={formatNumber(result.characters)} icon={CaseSensitive} tone="lavender" />
              </div>
              <TextOutput value={result.output} />
              <ResultActions getText={() => result.output} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <SegmentedControl label="Generate" options={UNITS} value={unitId} onChange={setUnitId} />
        <CalculatorInput id="lorem-count" label="How many" inputMode="numeric" value={countText} onChange={setCountText} error={errors.count} />
        <CheckField label="Start with “Lorem ipsum”" checked={classic} onChange={setClassic} />
      </TextToolShell>
    </ToolLayout>
  );
}
