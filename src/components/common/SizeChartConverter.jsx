import { useState } from 'react';
import ResultActions from './ResultActions.jsx';
import ResultDetails from './ResultDetails.jsx';
import ScheduleTable from './ScheduleTable.jsx';
import SegmentedControl from './SegmentedControl.jsx';
import TextToolShell from './TextToolShell.jsx';
import { buildSizeReport, buildSizeText, describeRow, findRow, getChart, sizesFor } from '../../utils/sizeChart.js';

const selectClass =
  'mt-2 block min-h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-white px-4 font-medium outline-none hover:border-mint focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-mint';

function Select({ id, label, value, options, onChange }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {label}
      </label>
      <select id={id} value={value} onChange={(event) => onChange(event.target.value)} className={selectClass}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export default function SizeChartConverter({ charts, idPrefix, icon, note, defaults }) {
  const [chartId, setChartId] = useState(defaults.chart);
  const [columnIndex, setColumnIndex] = useState(defaults.column);
  const chart = getChart(charts, chartId);
  const sizes = sizesFor(chart, columnIndex);
  const [size, setSize] = useState(defaults.size);
  const current = sizes.includes(size) ? size : sizes[Math.floor(sizes.length / 2)];
  const matches = findRow(chart, columnIndex, current);

  const changeSystem = (value) => {
    const next = Number(value);
    const row = chart.rows.find((item) => item[columnIndex] === current);
    setColumnIndex(next);
    if (row) setSize(row[next]);
  };

  const reset = () => {
    setChartId(defaults.chart);
    setColumnIndex(defaults.column);
    setSize(defaults.size);
  };

  return (
    <TextToolShell
      formLabel="Choose a size to convert"
      onClear={reset}
      panel={{ title: 'Matching Sizes', icon }}
      results={
        <>
          <p className="mt-5 text-sm font-medium">{describeRow(chart, matches, columnIndex)}</p>
          <ResultDetails items={matches.filter((_, index) => index !== columnIndex)} />
          <p className="mt-4 rounded-xl bg-soft-yellow px-4 py-3 text-sm font-medium">{note}</p>
          <ScheduleTable caption={`${chart.name} size chart`} columns={chart.columns} rows={chart.rows} />
          <ResultActions getText={() => buildSizeText(chart, matches, columnIndex, note)} getReport={() => buildSizeReport(chart, matches, columnIndex, note)} />
        </>
      }
    >
      <SegmentedControl label="Size chart" options={charts.map(({ id, name }) => ({ id, name }))} value={chartId} onChange={setChartId} />
      <Select id={`${idPrefix}-system`} label="Size system" value={String(columnIndex)} options={chart.columns.map((label, index) => ({ value: String(index), label }))} onChange={changeSystem} />
      <Select id={`${idPrefix}-size`} label="Your size" value={current} options={sizes.map((value) => ({ value, label: value }))} onChange={setSize} />
    </TextToolShell>
  );
}
