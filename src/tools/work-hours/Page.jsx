import { useState } from 'react';
import { BriefcaseBusiness, Clock, TimerReset } from 'lucide-react';
import * as content from './content.js';
import { buildResultText, evaluate, formatDecimalHours, formatHours } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import CalculatorShell from '../../components/common/CalculatorShell.jsx';
import CopyButton from '../../components/common/CopyButton.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import TimeField from '../../components/common/TimeField.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';
import { useCalculatorForm } from '../../hooks/useCalculatorForm.js';

const DEFAULT_HOURS = '8';

export default function WorkHoursPage() {
  const [clockIn, setClockIn] = useState('');
  const [clockOut, setClockOut] = useState('');
  const [breakMinutes, setBreakMinutes] = useState('');
  const [standardHours, setStandardHours] = useState(DEFAULT_HOURS);
  const form = useCalculatorForm();
  const { errors, result } = form.submitted ? evaluate({ clockIn, clockOut, breakMinutes, standardHours }) : { errors: {} };

  const reset = () => {
    setClockIn('');
    setClockOut('');
    setBreakMinutes('');
    setStandardHours(DEFAULT_HOURS);
    form.clear();
  };

  return (
    <ToolLayout toolId="work-hours-calculator" content={content}>
      <CalculatorShell
        form={form}
        formLabel="Enter your shift"
        onReset={reset}
        panel={{ title: 'Your Hours', icon: BriefcaseBusiness, emptyText: 'Enter your clock-in and clock-out times, then select Calculate.' }}
        results={
          result && (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Net Working Hours" value={formatHours(result.net)} icon={BriefcaseBusiness} />
                <ResultCard label="Overtime" value={formatHours(result.overtime)} icon={TimerReset} tone="yellow" />
                <ResultCard label="Total Shift" value={formatHours(result.shift)} icon={Clock} tone="lavender" />
              </div>
              {result.isOvernight && (
                <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">Clock-out is earlier than clock-in, so it is treated as the next day.</p>
              )}
              <ResultDetails
                items={[
                  { label: 'Break', value: formatHours(result.breakSeconds) },
                  { label: 'Decimal Hours', value: formatDecimalHours(result.decimalHours) },
                  { label: 'Daily Working Hours', value: formatHours(result.standard) },
                  { label: 'Below Daily Hours', value: formatHours(result.shortfall) },
                ]}
              />
              <CopyButton getText={() => buildResultText(result)} />
            </>
          )
        }
      >
        <TimeField id="work-in" label="Clock-in time" value={clockIn} onChange={setClockIn} error={errors.clockIn} />
        <TimeField id="work-out" label="Clock-out time" value={clockOut} onChange={setClockOut} error={errors.clockOut} />
        <CalculatorInput id="work-break" label="Break in minutes (optional)" value={breakMinutes} onChange={setBreakMinutes} error={errors.breakMinutes} />
        <CalculatorInput id="work-standard" label="Daily working hours" value={standardHours} onChange={setStandardHours} error={errors.standardHours} />
      </CalculatorShell>
    </ToolLayout>
  );
}
