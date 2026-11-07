import { useRef, useState } from 'react';
import { Award, BookOpen, GraduationCap, Plus, Trash2 } from 'lucide-react';
import * as content from './content.js';
import { SCALES, buildReport, buildResultText, evaluate, formatGpa, getScale } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import FormActions from '../../components/common/FormActions.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import ResultPanel from '../../components/common/ResultPanel.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useSubmitFocus } from '../../hooks/useSubmitFocus.js';
import { formatDecimal } from '../../utils/number.js';

const blankCourse = (id) => ({ id, name: '', grade: '', credits: '' });
const initialCourses = () => [1, 2, 3, 4].map(blankCourse);
const actionButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-white px-3 text-sm font-bold text-primary outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';
const selectClass = (error) =>
  `mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 bg-white px-4 font-medium outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint ${error ? 'border-danger' : 'border-line hover:border-mint'}`;

export default function GpaCalculatorPage() {
  const [scaleId, setScaleId] = useState(SCALES[0].id);
  const [courses, setCourses] = useState(initialCourses);
  const [previous, setPrevious] = useState({ gpa: '', credits: '' });
  const [submitCount, setSubmitCount] = useState(0);
  const [focusId, setFocusId] = useState(null);
  const nextId = useRef(5);
  const formRef = useRef(null);
  const headingRef = useRef(null);

  useSubmitFocus(submitCount, formRef, headingRef);

  const scale = getScale(scaleId);
  const { errors, result } = submitCount > 0 ? evaluate(scaleId, courses, previous) : { errors: {} };

  const update = (id, field, value) => setCourses((rows) => rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  const addCourse = () => {
    const id = nextId.current;
    nextId.current += 1;
    setCourses((rows) => [...rows, blankCourse(id)]);
    setFocusId(id);
  };

  const changeScale = (id) => {
    setScaleId(id);
    setCourses((rows) => rows.map((row) => ({ ...row, grade: '' })));
    setPrevious({ gpa: '', credits: '' });
    setSubmitCount(0);
  };

  const reset = () => {
    setCourses(initialCourses());
    setPrevious({ gpa: '', credits: '' });
    setSubmitCount(0);
    setFocusId(null);
  };

  const submit = (event) => {
    event.preventDefault();
    setSubmitCount((count) => count + 1);
  };

  return (
    <ToolLayout toolId="gpa-calculator" content={content}>
      <div className="mb-6">
        <SegmentedControl label="Grading scale" options={SCALES} value={scaleId} onChange={changeScale} />
      </div>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <section aria-label="Enter your courses" className="rounded-3xl bg-card p-6 shadow-card sm:p-8">
          <form ref={formRef} noValidate onSubmit={submit} className="flex flex-col gap-6">
            {courses.map(({ id, name, grade, credits }, index) => {
              const rowErrors = errors[id] ?? {};
              const prefix = <span className="sr-only">Course {index + 1} </span>;
              return (
                <fieldset key={id} className="grid items-start gap-3 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto]">
                  <legend className="sr-only">Course {index + 1}</legend>
                  <CalculatorInput id={`gpa-${id}-name`} inputMode="text" label={<>{prefix}Course name (optional)</>} value={name} autoFocus={focusId === id} onChange={(value) => update(id, 'name', value)} />
                  <div>
                    <label htmlFor={`gpa-${id}-grade`} className="block text-sm font-bold text-ink">
                      {prefix}Grade
                    </label>
                    <select
                      id={`gpa-${id}-grade`}
                      value={grade}
                      onChange={(event) => update(id, 'grade', event.target.value)}
                      aria-invalid={rowErrors.grade ? 'true' : undefined}
                      aria-describedby={rowErrors.grade ? `gpa-${id}-grade-error` : undefined}
                      className={selectClass(rowErrors.grade)}
                    >
                      <option value="">Choose</option>
                      {scale.grades.map(([label, points]) => (
                        <option key={label} value={label}>
                          {label} ({formatDecimal(points)})
                        </option>
                      ))}
                    </select>
                    {rowErrors.grade && (
                      <p id={`gpa-${id}-grade-error`} className="mt-1.5 text-sm font-medium text-danger">
                        {rowErrors.grade}
                      </p>
                    )}
                  </div>
                  <CalculatorInput id={`gpa-${id}-credits`} label={<>{prefix}Credits</>} value={credits} onChange={(value) => update(id, 'credits', value)} error={rowErrors.credits} />
                  <button
                    type="button"
                    aria-label={`Remove course ${index + 1}`}
                    disabled={courses.length === 1}
                    onClick={() => setCourses((rows) => rows.filter((row) => row.id !== id))}
                    className={`${actionButton} disabled:cursor-not-allowed disabled:opacity-50 sm:mt-7`}
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                    <span className="sm:hidden">Remove</span>
                  </button>
                </fieldset>
              );
            })}

            <button type="button" onClick={addCourse} className={actionButton}>
              <Plus aria-hidden="true" className="size-4" />
              Add course
            </button>

            <fieldset className="grid gap-3 rounded-2xl border-2 border-line p-4 sm:grid-cols-2">
              <legend className="px-1 text-sm font-bold">Previous results (optional)</legend>
              <CalculatorInput id="gpa-previous" label="Previous GPA" value={previous.gpa} onChange={(value) => setPrevious((current) => ({ ...current, gpa: value }))} error={errors.previousGpa} />
              <CalculatorInput id="gpa-previous-credits" label="Credits so far" value={previous.credits} onChange={(value) => setPrevious((current) => ({ ...current, credits: value }))} error={errors.previousCredits} />
            </fieldset>

            <FormActions onReset={reset} />
          </form>
        </section>

        <ResultPanel ref={headingRef} title="Your GPA" icon={GraduationCap} emptyText="Enter your grades and credits, then select Calculate to see your GPA.">
          {result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 sm:grid-cols-2">
                <ResultCard label={`GPA out of ${result.scale.max}`} value={formatGpa(result.gpa)} icon={GraduationCap} />
                {result.cumulative !== null ? (
                  <ResultCard label="Cumulative GPA" value={formatGpa(result.cumulative)} icon={Award} tone="yellow" />
                ) : (
                  <ResultCard label="Total credits" value={formatDecimal(result.totalCredits)} icon={BookOpen} tone="yellow" />
                )}
              </div>
              <ResultDetails
                items={[
                  ...(result.cumulative !== null ? [{ label: 'Total credits', value: formatDecimal(result.totalCredits) }] : []),
                  { label: 'Total grade points', value: formatDecimal(result.totalPoints) },
                  { label: 'Courses counted', value: String(result.courses.length) },
                ]}
              />
              <ResultActions getText={() => buildResultText(result)} getReport={() => buildReport(result)} />
            </>
          )}
        </ResultPanel>
      </div>
    </ToolLayout>
  );
}
