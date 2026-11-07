export default function ScheduleTable({ caption, columns, rows }) {
  return (
    <div tabIndex={0} role="region" aria-label={`${caption}, scrollable`} className="mt-4 overflow-x-auto rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-mint">
      <table className="w-full text-right text-sm">
        <caption className="mb-2 text-left font-bold">{caption}</caption>
        <thead>
          <tr className="border-b border-line text-ink/80">
            {columns.map((column, index) => (
              <th key={column} scope="col" className={`py-2 pr-3 font-semibold last:pr-0 ${index === 0 ? 'text-left' : ''}`}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(([first, ...rest]) => (
            <tr key={first} className="border-b border-line last:border-0">
              <th scope="row" className="py-2 pr-3 text-left font-semibold">{first}</th>
              {rest.map((cell, index) => (
                <td key={columns[index + 1]} className="py-2 pr-3 whitespace-nowrap last:pr-0">{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
