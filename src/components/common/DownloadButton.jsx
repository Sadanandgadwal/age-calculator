import { Download } from 'lucide-react';

export default function DownloadButton({ onClick, children = 'Download image', disabled = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-primary px-5 font-bold text-white transition-colors outline-none hover:opacity-90 focus-visible:ring-3 focus-visible:ring-mint focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
    >
      <Download aria-hidden="true" className="size-5" />
      {children}
    </button>
  );
}
