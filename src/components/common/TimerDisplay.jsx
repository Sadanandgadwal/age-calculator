export default function TimerDisplay({ value, label, tone = 'bg-secondary' }) {
  return (
    <div className={`rounded-2xl px-2 py-6 text-center sm:py-8 ${tone}`}>
      <p role="timer" aria-label={label} className="text-4xl font-extrabold tracking-tight tabular-nums [overflow-wrap:anywhere] sm:text-5xl">
        {value}
      </p>
      <p className="mt-2 text-sm font-semibold">{label}</p>
    </div>
  );
}
