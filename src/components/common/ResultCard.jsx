const TONES = {
  mint: { card: 'bg-secondary', icon: 'text-primary' },
  yellow: { card: 'bg-soft-yellow', icon: 'text-amber-700' },
  lavender: { card: 'bg-soft-lavender', icon: 'text-violet-700' },
};

export default function ResultCard({ label, value, icon: Icon, tone = 'mint' }) {
  const { card, icon } = TONES[tone];

  return (
    <div className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-2 py-4 text-center ${card}`}>
      {Icon && <Icon aria-hidden="true" className={`size-6 ${icon}`} />}
      <p className="flex flex-col">
        <span className="text-2xl leading-tight font-extrabold tracking-tight break-words tabular-nums">{value}</span>
        <span className="mt-1 text-xs font-semibold sm:text-sm">{label}</span>
      </p>
    </div>
  );
}
