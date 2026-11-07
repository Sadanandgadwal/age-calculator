import { useRef, useState } from 'react';
import { Calculator, Delete } from 'lucide-react';
import * as content from './content.js';
import { ANGLES, angleName, buildReport, buildResultText, calculate, formatNumber } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

const KEYS = [
  ['sin', 'sin('],
  ['cos', 'cos('],
  ['tan', 'tan('],
  ['(', '('],
  [')', ')'],
  ['sin⁻¹', 'asin(', 'sin⁻¹, inverse sine'],
  ['cos⁻¹', 'acos(', 'cos⁻¹, inverse cosine'],
  ['tan⁻¹', 'atan(', 'tan⁻¹, inverse tangent'],
  ['log', 'log('],
  ['ln', 'ln('],
  ['√', '√(', 'Square root'],
  ['x²', '^2', 'x², square'],
  ['xʸ', '^', 'xʸ, power'],
  ['n!', '!', 'n!, factorial'],
  ['%', '%', 'Percent'],
  ['7', '7'],
  ['8', '8'],
  ['9', '9'],
  ['÷', '÷', 'Divide'],
  ['π', 'π', 'Pi'],
  ['4', '4'],
  ['5', '5'],
  ['6', '6'],
  ['×', '×', 'Multiply'],
  ['e', 'e'],
  ['1', '1'],
  ['2', '2'],
  ['3', '3'],
  ['−', '−', 'Minus'],
  ['Ans', 'Ans', 'Ans, previous answer'],
  ['0', '0'],
  ['.', '.', 'Decimal point'],
  ['|x|', 'abs(', '|x|, absolute value'],
  ['+', '+', 'Plus'],
];

const keyClass =
  'min-h-11 cursor-pointer rounded-xl border-2 border-line bg-white px-1 text-sm font-bold text-ink outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint disabled:cursor-not-allowed disabled:opacity-50';

export default function ScientificCalculatorPage() {
  const [expression, setExpression] = useState('');
  const [angle, setAngle] = useState('deg');
  const [run, setRun] = useState(null);
  const [history, setHistory] = useState([]);
  const [memory, setMemory] = useState(null);
  const inputRef = useRef(null);
  const form = useCalculatorForm();

  const answer = run && 'value' in run ? run : null;
  const error = run?.error && run.expression === expression ? run.error : undefined;

  const edit = (next, cursor) => {
    setExpression(next);
    setTimeout(() => inputRef.current?.setSelectionRange(cursor, cursor), 0);
  };

  const insert = (text) => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? expression.length;
    const end = input?.selectionEnd ?? expression.length;
    edit(expression.slice(0, start) + text + expression.slice(end), start + text.length);
  };

  const backspace = () => {
    const input = inputRef.current;
    const start = input?.selectionStart ?? expression.length;
    const end = input?.selectionEnd ?? expression.length;
    if (start !== end) edit(expression.slice(0, start) + expression.slice(end), start);
    else if (start > 0) edit(expression.slice(0, start - 1) + expression.slice(start), start - 1);
  };

  const submit = (event) => {
    form.submit(event);
    const outcome = calculate(expression, { angle, ans: history[0]?.value ?? 0 });
    setRun({ expression, angle, ...outcome });
    if ('value' in outcome) setHistory((items) => [{ expression: expression.trim(), value: outcome.value }, ...items].slice(0, 5));
  };

  const reset = () => {
    setExpression('');
    setAngle('deg');
    setRun(null);
    setHistory([]);
    setMemory(null);
    form.clear();
  };

  return (
    <ToolLayout toolId="scientific-calculator" content={content}>
      <CalculatorShell
        form={{ ...form, submit }}
        formLabel="Enter a calculation"
        onReset={reset}
        submitLabel="Calculate"
        panel={{ title: 'Your Answer', icon: Calculator, emptyText: 'Type a calculation or use the keys, then select Calculate.' }}
        results={
          answer && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3">
                <ResultCard label="Answer" value={formatNumber(answer.value)} icon={Calculator} />
              </div>
              <ResultDetails
                items={[
                  { label: 'Calculation', value: answer.expression.trim() },
                  { label: 'Angle mode', value: angleName(answer.angle) },
                  ...(memory !== null ? [{ label: 'Memory', value: formatNumber(memory) }] : []),
                ]}
              />
              {history.length > 1 && (
                <section aria-label="Earlier answers" className="mt-4">
                  <h3 className="text-sm font-bold">Earlier answers</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {history.slice(1).map((item, index) => (
                      <li key={`${index}-${item.expression}`} className="break-words">
                        {item.expression} = <span className="font-bold">{formatNumber(item.value)}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              <ResultActions getText={() => buildResultText(answer)} getReport={() => buildReport(answer, history)} />
            </>
          )
        }
      >
        <CalculatorInput ref={inputRef} id="sci-expression" label="Calculation" inputMode="text" value={expression} onChange={setExpression} error={error} spellCheck="false" />
        <SegmentedControl label="Angle mode" options={ANGLES} value={angle} onChange={setAngle} />
        <div role="group" aria-label="Memory" className="grid grid-cols-4 gap-1.5">
          <button type="button" className={keyClass} aria-label="MC, clear memory" disabled={memory === null} onClick={() => setMemory(null)}>MC</button>
          <button type="button" className={keyClass} aria-label="MR, recall memory" disabled={memory === null} onClick={() => insert(formatNumber(memory).replace(' × 10^', 'e'))}>MR</button>
          <button type="button" className={keyClass} aria-label="M+, add answer to memory" disabled={!answer} onClick={() => setMemory((memory ?? 0) + answer.value)}>M+</button>
          <button type="button" className={keyClass} aria-label="M−, subtract answer from memory" disabled={!answer} onClick={() => setMemory((memory ?? 0) - answer.value)}>M−</button>
        </div>
        <div role="group" aria-label="Calculator keys" className="grid grid-cols-5 gap-1.5">
          {KEYS.map(([label, text, name]) => (
            <button key={label} type="button" className={keyClass} aria-label={name} onClick={() => insert(text)}>
              {label}
            </button>
          ))}
          <button type="button" className={keyClass} aria-label="Delete last character" onClick={backspace}>
            <Delete aria-hidden="true" className="mx-auto size-5" />
          </button>
        </div>
      </CalculatorShell>
    </ToolLayout>
  );
}
