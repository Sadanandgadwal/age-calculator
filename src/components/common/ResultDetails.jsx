export default function ResultDetails({ items }) {
  return (
    <dl className="mt-4 divide-y divide-line border-y border-line">
      {items.map(({ label, value }) => (
        <div key={label} className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 py-3">
          <dt className="text-sm font-medium text-ink/80">{label}</dt>
          <dd className="font-extrabold break-words">{value}</dd>
        </div>
      ))}
    </dl>
  );
}
