import { useContext, useEffect, useRef, useState } from 'react';
import { createPortal, flushSync } from 'react-dom';
import BrandMark from './BrandMark.jsx';
import { ToolNameContext } from './toolContext.js';
import { siteConfig } from '../../config/site.js';

const DENSE_ROWS = 12;
const timestampFormatter = new Intl.DateTimeFormat('en-GB', { dateStyle: 'long', timeStyle: 'short' });

function Rows({ title, items }) {
  if (!items?.length) return null;
  return (
    <section className="pr-section">
      <h2>{title}</h2>
      <dl className="pr-rows">
        {items.map(({ label, value }) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Lines({ title, lines }) {
  if (!lines?.length) return null;
  return (
    <section className="pr-section">
      <h2>{title}</h2>
      {lines.map((line) => (
        <p key={line}>{line}</p>
      ))}
    </section>
  );
}

function ReportDocument({ title, report, printedAt, url }) {
  const { subtitle, inputs, results, details, /* formula, steps, */ table, notes } = report;

  return (
    <article className="print-report" data-dense={table?.rows.length > DENSE_ROWS || undefined}>
      <header className="pr-brand">
        <span className="pr-logo">
          <BrandMark className="pr-mark" />
          {siteConfig.name}
        </span>
        <span>Calculation report</span>
      </header>

      <h1>{title}</h1>
      {subtitle && <p className="pr-subtitle">{subtitle}</p>}

      <Rows title="Values entered" items={inputs} />

      <section className="pr-section">
        <h2>Result</h2>
        <div className="pr-results" data-count={Math.min(results.length, 4)}>
          {results.map(({ label, value }) => (
            <div key={label}>
              <strong>{value}</strong>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </section>

      <Rows title="Details" items={details} />

      {table && (
        <section className="pr-section">
          <h2>{table.caption}</h2>
          <table className="pr-table">
            <thead>
              <tr>
                {table.columns.map((column) => (
                  <th key={column} scope="col">{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {table.rows.map((row) => (
                <tr key={row.join('|')}>
                  {row.map((cell, index) => (
                    <td key={`${index}-${cell}`}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {/* <Lines title="Formula" lines={formula ? [formula] : null} />
      <Lines title="Calculation steps" lines={steps} /> */}
      <Lines title="Notes" lines={notes} />

      <footer className="pr-footer">
        <span>Generated on {timestampFormatter.format(printedAt)}</span>
        <span>{url}</span>
      </footer>
    </article>
  );
}

export default function PrintReportHost({ getReport, title }) {
  const toolName = useContext(ToolNameContext);
  const [printing, setPrinting] = useState(null);
  const latest = useRef(getReport);
  const anchor = useRef(null);

  useEffect(() => {
    latest.current = getReport;
  });

  useEffect(() => {
    const open = () => {
      if (anchor.current?.parentElement.closest('[hidden]')) return;
      const printedAt = new Date();
      flushSync(() => setPrinting({ report: latest.current(), printedAt, url: window.location.href }));
    };
    const close = () => setPrinting(null);

    window.addEventListener('beforeprint', open);
    window.addEventListener('afterprint', close);
    return () => {
      window.removeEventListener('beforeprint', open);
      window.removeEventListener('afterprint', close);
    };
  }, []);

  return (
    <>
      <span ref={anchor} hidden />
      {printing && createPortal(<ReportDocument title={title ?? toolName} {...printing} />, document.body)}
    </>
  );
}
