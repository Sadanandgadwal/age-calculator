import { useRef, useState } from 'react';
import { Award, BookOpenCheck, Plus, Scale, Trash2 } from 'lucide-react';
import * as content from './content.js';
import { buildReport, buildResultText, describeTarget, describeWeights, evaluate, formatPercent } from './logic.js';
import GradeScale from '../marks-percentage/GradeScale.jsx';
import { getGrade, scaleRows, validateScale } from '../marks-percentage/logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useSubmitFocus } from '../../hooks/useSubmitFocus.js';

const blankItem = (id) => ({ id, name: '', score: '', weight: '' });
const initialItems = () => [1, 2, 3].map(blankItem);
const actionButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-white px-3 text-sm font-bold text-primary outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';

export default function GradeCalculatorPage() {
  const [items, setItems] = useState(initialItems);
  const [target, setTarget] = useState('');
  const [scaleId, setScaleId] = useState('standard');
  const [gradeRows, setGradeRows] = useState(() => scaleRows('standard'));
  const [submitCount, setSubmitCount] = useState(0);
  const [focusId, setFocusId] = useState(null);
  const nextId = useRef(4);
  const formRef = useRef(null);
  const headingRef = useRef(null);

  useSubmitFocus(submitCount, formRef, headingRef);

  const { errors, result } = submitCount > 0 ? evaluate(items, target) : { errors: {} };
  const grade = result && validateScale(gradeRows).isValid ? getGrade(result.percent, gradeRows) : null;
  const notes = result ? [describeTarget(result), describeWeights(result.totalWeight)].filter(Boolean) : [];

  const update = (id, field, value) => setItems((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  const addItem = () => {
    const id = nextId.current;
    nextId.current += 1;
    setItems((rows) => [...rows, blankItem(id)]);
    setFocusId(id);
  };

  const reset = () => {
    setItems(initialItems());
    setTarget('');
    setSubmitCount(0);
    setFocusId(null);
  };

  const submit = (event) => {
    event.preventDefault();
    setSubmitCount((count) => count + 1);
  };

  return (
    <ToolLayout toolId="grade-calculator" content={content}>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section aria-label="Enter your scores" className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
          <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-6">
            {items.map(({ id, name, score, weight }, index) => {
              const rowErrors = errors[id] ?? {};
              const prefix = <span className="sr-only">Item {index + 1} </span>;
              return (
                <fieldset key={id} className="grid items-start gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <legend className="sr-only">Item {index + 1}</legend>
                  <CalculatorInput id={`assessment-${id}-name`} inputMode="text" label={<>{prefix}Name (optional)</>} value={name} autoFocus={focusId === id} onChange={(value) => update(id, 'name', value)} />
                  <CalculatorInput id={`assessment-${id}-score`} label={<>{prefix}Score</>} suffix="%" value={score} onChange={(value) => update(id, 'score', value)} error={rowErrors.score} />
                  <CalculatorInput id={`assessment-${id}-weight`} label={<>{prefix}Weight</>} suffix="%" value={weight} onChange={(value) => update(id, 'weight', value)} error={rowErrors.weight} />
                  <button
                    type="button"
                    aria-label={`Remove item ${index + 1}`}
                    disabled={items.length === 1}
                    onClick={() => setItems((rows) => rows.filter((row) => row.id !== id))}
                    className={`${actionButton} disabled:cursor-not-allowed disabled:opacity-50 sm:mt-7`}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    <span className="sm:hidden">Remove</span>
                  </button>
                </fieldset>
              );
            })}

            <button type="button" onClick={addItem} className={actionButton}>
              <Plus aria-hidden="true" className="size-4" />
              Add item
            </button>

            <CalculatorInput id="grade-target" label="Target overall score (optional)" suffix="%" value={target} onChange={setTarget} error={errors.target} />

            <FormActions onReset={reset} />
          </form>
        </section>

        <ResultPanel ref={headingRef} title="Your Grade" icon={Award} emptyText="Enter your scores and weights, then select Calculate to see your grade.">
          {result && (
            <>
              <div className="mt-5 grid gap-2 sm:grid-cols-3 sm:gap-3 lg:grid-cols-1 xl:grid-cols-3">
                <ResultCard label="Weighted score" value={formatPercent(result.percent)} icon={BookOpenCheck} />
                <ResultCard label="Grade" value={grade ?? '—'} icon={Award} tone="yellow" />
                <ResultCard label="Total weight" value={formatPercent(result.totalWeight)} icon={Scale} tone="lavender" />
              </div>
              {notes.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm">
                  {notes.map((note) => (
                    <li key={note} className="rounded-xl bg-soft-yellow px-4 py-3 font-medium">{note}</li>
                  ))}
                </ul>
              )}
              <ResultDetails items={result.items.map(({ name, score, weight }, index) => ({ label: `${index + 1}. ${name}`, value: `${formatPercent(score)} × ${formatPercent(weight)}` }))} />
              <ResultActions getText={() => buildResultText(result, grade)} getReport={() => buildReport(result, grade)} />
            </>
          )}
        </ResultPanel>
      </div>
      <GradeScale
        scaleId={scaleId}
        rows={gradeRows}
        onChange={(nextScaleId, rows) => {
          setScaleId(nextScaleId);
          setGradeRows(rows);
        }}
      />
    </ToolLayout>
  );
}
