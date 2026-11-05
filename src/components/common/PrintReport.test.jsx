import { act, render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import PrintReportHost from './PrintReport.jsx';
import { ToolNameContext } from './toolContext.js';

const REPORT = {
  subtitle: 'A mode',
  inputs: [{ label: 'Value entered', value: '5' }],
  results: [{ label: 'Answer', value: '10' }],
  details: [{ label: 'Extra', value: 'More' }],
  formula: 'A = B',
  steps: ['Step one'],
  table: { caption: 'Rows', columns: ['A', 'B'], rows: [[1, 2]] },
  notes: ['A note'],
};

const firePrint = (type) => act(() => window.dispatchEvent(new Event(type)));
const report = () => document.querySelector('.print-report');

describe('PrintReportHost', () => {
  it('adds the report only while printing', () => {
    render(
      <ToolNameContext.Provider value="Some Tool">
        <PrintReportHost getReport={() => REPORT} />
      </ToolNameContext.Provider>,
    );
    expect(report()).toBeNull();

    firePrint('beforeprint');
    expect(report().parentElement).toBe(document.body);
    expect(report().querySelector('h1').textContent).toBe('Some Tool');
    for (const text of ['ToolNest', 'A mode', 'Value entered', 'Answer', 'Extra', 'Rows', 'A note', 'Generated on']) {
      expect(report().textContent).toContain(text);
    }
    for (const text of ['Formula', 'A = B', 'Calculation steps', 'Step one']) {
      expect(report().textContent).not.toContain(text);
    }

    firePrint('afterprint');
    expect(report()).toBeNull();
  });

  it('uses the newest report and values', () => {
    const { rerender } = render(<PrintReportHost title="T" getReport={() => REPORT} />);
    rerender(<PrintReportHost title="T" getReport={() => ({ results: [{ label: 'Answer', value: 'Newest' }] })} />);
    firePrint('beforeprint');
    expect(report().textContent).toContain('Newest');
    firePrint('afterprint');
  });

  it('skips a tool mode that is hidden, so only one report prints', () => {
    render(
      <>
        <div hidden>
          <PrintReportHost title="Hidden" getReport={() => REPORT} />
        </div>
        <div>
          <PrintReportHost title="Shown" getReport={() => REPORT} />
        </div>
      </>,
    );
    firePrint('beforeprint');
    const reports = document.querySelectorAll('.print-report');
    expect(reports).toHaveLength(1);
    expect(reports[0].querySelector('h1').textContent).toBe('Shown');
    firePrint('afterprint');
  });

  it('marks long tables as dense', () => {
    const rows = Array.from({ length: 13 }, (_, index) => [index, index]);
    render(<PrintReportHost title="T" getReport={() => ({ ...REPORT, table: { ...REPORT.table, rows } })} />);
    firePrint('beforeprint');
    expect(report().hasAttribute('data-dense')).toBe(true);
    firePrint('afterprint');
  });
});
