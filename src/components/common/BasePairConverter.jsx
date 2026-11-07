import { useState } from 'react';
import { Binary } from 'lucide-react';
import CalculatorInput from './CalculatorInput.jsx';
import ResultActions from './ResultActions.jsx';
import ResultDetails from './ResultDetails.jsx';
import ScheduleTable from './ScheduleTable.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import TextToolShell, { TextOutput } from './TextToolShell.jsx';
import { buildPairReport, buildPairText, convertPair } from '../../utils/basePair.js';
import { baseName } from '../../utils/numberBase.js';

export default function BasePairConverter({ modes, idPrefix }) {
  const [modeId, setModeId] = useState(modes[0].id);
  const [text, setText] = useState('');
  const mode = modes.find((item) => item.id === modeId);
  const { error, result } = convertPair(text, mode);

  const changeMode = (id) => {
    const next = modes.find((item) => item.id === id);
    if (result) setText(result.output);
    setModeId(next.id);
  };

  return (
    <>
      <div className="mb-6">
        <SegmentedControl label="Direction" options={modes} value={modeId} onChange={changeMode} />
      </div>
      <TextToolShell
        formLabel={`Enter a ${baseName(mode.from).toLowerCase()} number`}
        onClear={() => setText('')}
        panel={{ title: `${baseName(mode.to)} Result`, icon: Binary, emptyText: `Enter a ${baseName(mode.from).toLowerCase()} number to convert it instantly.` }}
        results={
          result && (
            <>
              <TextOutput label={baseName(result.to)} value={result.output} className="font-mono text-base" />
              {result.working && (
                <div className="mt-4">
                  <h3 className="text-sm font-bold">Working</h3>
                  <p className="mt-1 font-mono text-sm break-words">{result.working}</p>
                </div>
              )}
              {result.steps && (
                <>
                  <ScheduleTable caption="Working" columns={['Divide', 'Result', 'Remainder']} rows={result.steps.map(({ dividend, quotient, remainder }) => [`${dividend} ÷ ${result.to}`, quotient, remainder])} />
                  <p className="mt-2 text-sm">Read the remainders from bottom to top: <span className="font-mono font-bold">{result.output.replace('-', '')}</span></p>
                </>
              )}
              {!result.working && !result.steps && <p className="mt-4 text-sm">This number is too long to show the working.</p>}
              <ResultDetails items={result.others} />
              <ResultActions getText={() => buildPairText(result)} getReport={() => buildPairReport(result)} />
            </>
          )
        }
      >
        <CalculatorInput id={`${idPrefix}-value`} label={`${baseName(mode.from)} number`} inputMode={mode.from === 10 ? 'numeric' : 'text'} spellCheck="false" value={text} onChange={setText} error={error} />
      </TextToolShell>
    </>
  );
}
