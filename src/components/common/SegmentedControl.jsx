export default function SegmentedControl({ label, options, value, onChange }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap justify-center gap-2">
      {options.map(({ id, name }) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={`inline-flex min-h-11 cursor-pointer items-center rounded-full border-2 px-4 text-sm font-semibold transition-colors outline-none focus-visible:ring-3 focus-visible:ring-mint ${
            value === id
              ? 'border-primary bg-primary text-white'
              : 'border-line bg-white text-primary hover:border-mint hover:bg-secondary'
          }`}
        >
          {name}
        </button>
      ))}
    </div>
  );
}
