/** The ToolNest mark: tools gathered in one place. Decorative, as the name sits beside it. */
export default function BrandMark({ className }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={className}>
      <rect width="64" height="64" rx="15" fill="#0B6657" />
      <rect x="14" y="14" width="16" height="16" rx="4" fill="#FFFFFF" />
      <rect x="34" y="14" width="16" height="16" rx="8" fill="#BDE8D5" />
      <rect x="14" y="34" width="16" height="16" rx="8" fill="#F59E0B" />
      <rect x="34" y="34" width="16" height="16" rx="4" fill="#FFFFFF" />
    </svg>
  );
}
