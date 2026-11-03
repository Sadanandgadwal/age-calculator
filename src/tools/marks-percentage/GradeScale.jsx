import { useRef } from 'react';
import { ChevronDown, Plus, Trash2 } from 'lucide-react';
import { GRADE_SCALES, scaleRows, validateScale } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';

const smallButton =
  'inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border-2 border-line bg-white px-3 text-sm font-bold text-primary outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';

export default function GradeScale({ scaleId, rows, onChange }) {
  const nextId = useRef(0);
  const { rowErrors, missingZero } = validateScale(rows);

  const updateRow = (id, field, value) =>
    onChange('custom', rows.map((row) => (row.id === id ? { ...row, [field]: value } : row)));

  const addRow = () => {
    nextId.current += 1;
    onChange('custom', [...rows, { id: `custom-${nextId.current}`, label: '', min: '' }]);
  };

  return (
    <details className="group mt-6 rounded-3xl bg-card px-6 shadow-card">
      <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-extrabold marker:content-none [&::-webkit-details-marker]:hidden">
        <h2>Grading scale</h2>
        <ChevronDown aria-hidden="true" className="size-5 shrink-0 text-primary transition-transform group-open:rotate-180" />
      </summary>

      <div className="pb-6">
        <p className="text-sm text-ink/80">These are example scales. Edit them to match your board or institution.</p>

        <label htmlFor="grade-scale" className="mt-4 block text-sm font-bold">
          Scale
        </label>
        <select
          id="grade-scale"
          value={scaleId}
          onChange={(event) => onChange(event.target.value, scaleRows(event.target.value))}
          className="mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint sm:max-w-xs"
        >
          {Object.entries(GRADE_SCALES).map(([id, { name }]) => (
            <option key={id} value={id}>
              {name}
            </option>
          ))}
          <option value="custom" disabled={scaleId !== 'custom'}>
            Custom
          </option>
        </select>

        <div className="mt-4 flex flex-col gap-3">
          {rows.map(({ id, label, min }, index) => (
            <div key={id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] items-start gap-3">
              <CalculatorInput
                id={`grade-${id}-label`}
                inputMode="text"
                label={<><span className="sr-only">Row {index + 1} </span>Grade</>}
                value={label}
                onChange={(value) => updateRow(id, 'label', value)}
                error={rowErrors[id]?.label}
              />
              <CalculatorInput
                id={`grade-${id}-min`}
                label={<><span className="sr-only">Row {index + 1} </span>Minimum %</>}
                value={min}
                onChange={(value) => updateRow(id, 'min', value)}
                error={rowErrors[id]?.min}
              />
              <button
                type="button"
                aria-label={`Remove grade row ${index + 1}`}
                disabled={rows.length === 1}
                onClick={() => onChange('custom', rows.filter((row) => row.id !== id))}
                className={`${smallButton} mt-7 disabled:cursor-not-allowed disabled:opacity-50`}
              >
                <Trash2 aria-hidden="true" className="size-4" />
              </button>
            </div>
          ))}
        </div>

        {missingZero && <p className="mt-3 text-sm font-medium text-danger">Add a grade with a minimum of 0, so every percentage gets a grade.</p>}

        <button type="button" onClick={addRow} className={`${smallButton} mt-4`}>
          <Plus aria-hidden="true" className="size-4" />
          Add grade
        </button>
      </div>
    </details>
  );
}
