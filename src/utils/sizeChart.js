export const getChart = (charts, chartId) => charts.find((chart) => chart.id === chartId) ?? charts[0];

export const sizesFor = (chart, columnIndex) => [...new Set(chart.rows.map((row) => row[columnIndex]))];

export function findRow(chart, columnIndex, value) {
  const row = chart.rows.find((item) => item[columnIndex] === value);
  return row ? chart.columns.map((label, index) => ({ label, value: row[index] })) : null;
}

export const describeRow = (chart, matches, columnIndex) =>
  `${chart.name}: ${matches[columnIndex].label} ${matches[columnIndex].value} = ${matches
    .filter((_, index) => index !== columnIndex)
    .map(({ label, value }) => `${label} ${value}`)
    .join(', ')}`;

export function buildSizeText(chart, matches, columnIndex, note) {
  return [describeRow(chart, matches, columnIndex), note].join('\n');
}

export function buildSizeReport(chart, matches, columnIndex, note) {
  return {
    subtitle: chart.name,
    inputs: [{ label: matches[columnIndex].label, value: matches[columnIndex].value }],
    results: matches.filter((_, index) => index !== columnIndex),
    table: { caption: `${chart.name} size chart`, columns: chart.columns, rows: chart.rows },
    notes: [note],
  };
}
