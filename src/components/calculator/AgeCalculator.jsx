import AgeForm from './AgeForm.jsx';
import AgeResults from './AgeResults.jsx';
import { useAgeCalculator } from '../../hooks/useAgeCalculator.js';

export default function AgeCalculator() {
  const { dob, asOf, errors, result, isStale, setDob, setAsOf, calculate, reset } = useAgeCalculator();

  return (
    <div
      data-testid="calculator-layout"
      className="grid items-start gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7.5fr)] print:block"
    >
      <AgeForm
        dob={dob}
        asOf={asOf}
        errors={errors}
        onDobChange={setDob}
        onAsOfChange={setAsOf}
        onCalculate={calculate}
        onReset={reset}
      />
      <AgeResults result={result} isStale={isStale} />
    </div>
  );
}
