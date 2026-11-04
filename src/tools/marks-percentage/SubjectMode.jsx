import { useRef, useState } from 'react';
import { Award, Percent, Plus, Sigma, Trash2 } from 'lucide-react';
import { buildSubjectsReport, buildSubjectsText, calculateSubjects, getGrade, validateSubjects } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import { useSubmitFocus } from '../../hooks/useSubmitFocus.js';
import { formatDecimal } from '../../utils/number.js';

const blankSubject = (id) => ({ id, name: '', max: '', obtained: '' });
const initialSubjects = () => [blankSubject(1), blankSubject(2), blankSubject(3)];
const actionButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-white px-3 text-sm font-bold text-primary outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';

export default function SubjectMode({ gradeRows, isScaleValid }) {
  const [subjects, setSubjects] = useState(initialSubjects);
  const [submitCount, setSubmitCount] = useState(0);
  const [focusId, setFocusId] = useState(null);
  const nextId = useRef(4);
  const formRef = useRef(null);
  const headingRef = useRef(null);

  useSubmitFocus(submitCount, formRef, headingRef);

  const errors = submitCount > 0 ? validateSubjects(subjects) : {};
  const result = submitCount > 0 && Object.keys(errors).length === 0 ? calculateSubjects(subjects) : null;
  const grade = result && isScaleValid ? getGrade(result.percent, gradeRows) : null;

  const update = (id, field, value) =>
    setSubjects((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  const addSubject = () => {
    const id = nextId.current;
    nextId.current += 1;
    setSubjects((rows) => [...rows, blankSubject(id)]);
    setFocusId(id);
  };

  const reset = () => {
    setSubjects(initialSubjects());
    setSubmitCount(0);
    setFocusId(null);
  };

  const submit = (event) => {
    event.preventDefault();
    setSubmitCount((count) => count + 1);
  };

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
      <section aria-label="Enter your subjects" className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
        <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-6">
          {subjects.map(({ id, name, max, obtained }, index) => {
            const rowErrors = errors[id] ?? {};
            const prefix = <span className="sr-only">Subject {index + 1} </span>;
            return (
              <fieldset key={id} className="grid items-start gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                <legend className="sr-only">Subject {index + 1}</legend>
                <CalculatorInput
                  id={`subject-${id}-name`}
                  inputMode="text"
                  label={<>{prefix}Subject name</>}
                  value={name}
                  autoFocus={focusId === id}
                  onChange={(value) => update(id, 'name', value)}
                  error={rowErrors.name}
                />
                <CalculatorInput
                  id={`subject-${id}-max`}
                  label={<>{prefix}Maximum marks</>}
                  value={max}
                  onChange={(value) => update(id, 'max', value)}
                  error={rowErrors.max}
                />
                <CalculatorInput
                  id={`subject-${id}-obtained`}
                  label={<>{prefix}Obtained marks</>}
                  value={obtained}
                  onChange={(value) => update(id, 'obtained', value)}
                  error={rowErrors.obtained}
                />
                <button
                  type="button"
                  aria-label={`Remove subject ${index + 1}`}
                  disabled={subjects.length === 1}
                  onClick={() => setSubjects((rows) => rows.filter((row) => row.id !== id))}
                  className={`${actionButton} disabled:cursor-not-allowed disabled:opacity-50 sm:mt-7`}
                >
                  <Trash2 aria-hidden="true" className="size-4" />
                  <span className="sm:hidden">Remove</span>
                </button>
              </fieldset>
            );
          })}

          <button type="button" onClick={addSubject} className={actionButton}>
            <Plus aria-hidden="true" className="size-4" />
            Add subject
          </button>

          <FormActions onReset={reset} />
        </form>
      </section>

      <ResultPanel ref={headingRef} emptyText="Enter your subjects and select Calculate to see your results.">
        {result && (
          <>
            <div className="mt-5 grid grid-cols-3 gap-2 sm:gap-3">
              <ResultCard label="Percentage" value={`${formatDecimal(result.percent)}%`} icon={Percent} />
              <ResultCard label="Grade" value={grade ?? '—'} icon={Award} tone="yellow" />
              <ResultCard label="Subjects" value={result.rows.length} icon={Sigma} tone="lavender" />
            </div>
            <ResultDetails
              items={[
                { label: 'Total Obtained Marks', value: formatDecimal(result.obtained) },
                { label: 'Total Maximum Marks', value: formatDecimal(result.max) },
                { label: 'Average Marks', value: formatDecimal(result.average) },
                { label: 'Highest Scoring', value: result.highest },
                { label: 'Lowest Scoring', value: result.lowest },
              ]}
            />
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <caption className="sr-only">Marks by subject</caption>
                <thead>
                  <tr className="border-b border-line text-ink/80">
                    <th scope="col" className="py-2 pr-3 font-semibold">Subject</th>
                    <th scope="col" className="py-2 pr-3 text-right font-semibold">Marks</th>
                    <th scope="col" className="py-2 text-right font-semibold">%</th>
                  </tr>
                </thead>
                <tbody>
                  {result.rows.map(({ id, name, obtained, max, percent }) => (
                    <tr key={id} className="border-b border-line last:border-0">
                      <th scope="row" className="py-2 pr-3 font-semibold break-words">{name}</th>
                      <td className="py-2 pr-3 text-right whitespace-nowrap">{formatDecimal(obtained)} / {formatDecimal(max)}</td>
                      <td className="py-2 text-right font-bold">{formatDecimal(percent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <ResultActions getText={() => buildSubjectsText(result, grade)} getReport={() => buildSubjectsReport(result, grade)} />
          </>
        )}
      </ResultPanel>
    </div>
  );
}
