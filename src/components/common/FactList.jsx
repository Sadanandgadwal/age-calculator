export default function FactList({ items, label = 'Details' }) {
  return (
    <dl aria-label={label} data-testid="facts" className="mt-4 divide-y divide-line rounded-xl bg-page px-4 text-sm">
      {items.map(({ label: name, value }) => (
        <div key={name} className="flex items-baseline justify-between gap-4 py-2">
          <dt className="font-medium text-ink/80">{name}</dt>
          <dd className="min-w-0 text-right font-bold [overflow-wrap:anywhere]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
