/** App mark: a calendar with a small birthday cake. Decorative, as the app name sits beside it. */
export default function Logo({ className }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" aria-hidden="true" className={className}>
      <rect x="4" y="9" width="46" height="44" rx="9" stroke="#0B6657" strokeWidth="4" />
      <path d="M4 22h46" stroke="#0B6657" strokeWidth="4" />
      <path d="M16 4v10M38 4v10" stroke="#0B6657" strokeWidth="4" strokeLinecap="round" />
      <circle cx="16" cy="34" r="3" fill="#BDE8D5" />
      <circle cx="27" cy="34" r="3" fill="#0B6657" />
      <circle cx="16" cy="44" r="3" fill="#0B6657" />
      <rect x="32" y="42" width="30" height="20" rx="5" fill="#F59E0B" />
      <path d="M32 47c5 4 5 4 10 0s5-4 10 0 5 4 10 0v-1a5 5 0 0 0-5-5H37a5 5 0 0 0-5 5z" fill="#FFF4DC" />
      <path d="M40 41v-8M47 41v-8M54 41v-8" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}
