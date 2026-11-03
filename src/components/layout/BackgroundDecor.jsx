/** Soft mint shapes in the page corners. Purely decorative. */
export default function BackgroundDecor() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden print:hidden">
      <svg viewBox="0 0 260 240" className="absolute top-0 left-0 w-40 sm:w-64">
        <path d="M0 0h260c-20 60-70 62-120 78C90 94 40 130 0 240z" fill="#EAF7EF" />
        <path d="M0 0h190c-16 44-62 44-104 58C50 70 22 100 0 170z" fill="#BDE8D5" fillOpacity="0.45" />
      </svg>
      <svg viewBox="0 0 360 170" className="absolute right-0 bottom-0 w-52 sm:w-96">
        <path d="M360 170H0c30-60 90-60 150-74 70-16 140-30 210-96z" fill="#EAF7EF" />
        <path d="M360 170H130c24-40 80-44 124-58 42-12 78-30 106-62z" fill="#BDE8D5" fillOpacity="0.45" />
      </svg>
    </div>
  );
}
