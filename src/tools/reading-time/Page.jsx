import { useState } from 'react';
import { BookOpen, Mic, WholeWord } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, evaluate } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import TextToolShell, { TextField } from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { formatNumber } from '../../utils/formatResult.js';
import { READING_WPM, SPEAKING_WPM } from '../../utils/textStats.js';

export default function ReadingTimePage() {
  const [text, setText] = useState('');
  const [reading, setReading] = useState(String(READING_WPM));
  const [speaking, setSpeaking] = useState(String(SPEAKING_WPM));
  const { errors, result } = evaluate(text, reading, speaking);

  const clear = () => {
    setText('');
    setReading(String(READING_WPM));
    setSpeaking(String(SPEAKING_WPM));
  };

  return (
    <ToolLayout toolId="reading-time-calculator" content={content}>
      <TextToolShell
        formLabel="Enter your text"
        onClear={clear}
        panel={{ title: 'Your Time', icon: BookOpen, emptyText: 'Type or paste your text to estimate the time.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Reading Time" value={result.readingTime} icon={BookOpen} />
                <ResultCard label="Speaking Time" value={result.speakingTime} icon={Mic} tone="yellow" />
                <ResultCard label="Words" value={formatNumber(result.words)} icon={WholeWord} tone="lavender" />
              </div>
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )
        }
      >
        <TextField id="read-text" label="Your text" rows={10} value={text} onChange={setText} />
        <CalculatorInput id="read-speed" label="Reading speed (words a minute)" inputMode="numeric" value={reading} onChange={setReading} error={errors.reading} />
        <CalculatorInput id="speak-speed" label="Speaking speed (words a minute)" inputMode="numeric" value={speaking} onChange={setSpeaking} error={errors.speaking} />
      </TextToolShell>
    </ToolLayout>
  );
}
