import { useState } from 'react';
import { Activity, CalendarRange, Clock } from 'lucide-react';
import * as content from './content.js';
import { MODES, PERIODS, buildDowntimeReport, buildDowntimeText, buildUptimeReport, buildUptimeText, evaluateDowntime, evaluateUptime, formatUptime } from './logic.js';
import CalculatorInput from '../../components/common/CalculatorInput.jsx';
import ResultActions from '../../components/common/ResultActions.jsx';
import ResultCard from '../../components/common/ResultCard.jsx';
import ResultDetails from '../../components/common/ResultDetails.jsx';
import SegmentedControl from '../../components/common/SegmentedControl.jsx';
import TextToolShell from '../../components/common/TextToolShell.jsx';
import ToolLayout from '../../components/layout/ToolLayout.jsx';

export default function UptimeCalculatorPage() {
  const [modeId, setModeId] = useState(MODES[0].id);
  const [uptimeText, setUptimeText] = useState('');
  const [minutesText, setMinutesText] = useState('');
  const [periodId, setPeriodId] = useState('month');
  const isToDowntime = modeId === 'to-downtime';
  const toDowntime = evaluateUptime(uptimeText);
  const toUptime = evaluateDowntime(minutesText, periodId);
  const { error, result } = isToDowntime ? toDowntime : toUptime;

  const clear = () => {
    setUptimeText('');
    setMinutesText('');
  };

  return (
    <ToolLayout toolId="uptime-calculator" content={content}>
      <TextToolShell
        formLabel="Enter your uptime or downtime"
        onClear={clear}
        panel={{ title: isToDowntime ? 'Allowed Downtime' : 'Your Uptime', icon: Activity, emptyText: 'Enter a value to see the result.' }}
        results={
          result &&
          (isToDowntime ? (
            <>
              <ResultDetails items={result.rows.map(({ name, value }) => ({ label: `Per ${name}`, value }))} />
              <ResultActions getText={() => buildDowntimeText(result)} getReport={() => buildDowntimeReport(result)} />
            </>
          ) : (
            <>
              <div className="mt-5 grid gap-2 sm:gap-3 lg:grid-cols-3">
                <ResultCard label="Uptime" value={formatUptime(result.uptime)} icon={Activity} />
                <ResultCard label="Downtime" value={result.downtime} icon={Clock} tone="yellow" />
                <ResultCard label="Period" value={result.period} icon={CalendarRange} tone="lavender" />
              </div>
              <ResultActions getText={() => buildUptimeText(result)} getReport={() => buildUptimeReport(result)} />
            </>
          ))
        }
      >
        <SegmentedControl label="Calculation" options={MODES} value={modeId} onChange={setModeId} />
        {isToDowntime ? (
          <CalculatorInput id="uptime-percent" label="Uptime" suffix="%" value={uptimeText} onChange={setUptimeText} error={error} />
        ) : (
          <>
            <CalculatorInput id="uptime-minutes" label="Downtime (minutes)" value={minutesText} onChange={setMinutesText} error={error} />
            <SegmentedControl label="Period" options={PERIODS} value={periodId} onChange={setPeriodId} />
          </>
        )}
      </TextToolShell>
    </ToolLayout>
  );
}
