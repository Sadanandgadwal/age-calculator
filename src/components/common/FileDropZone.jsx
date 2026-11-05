import { useState } from 'react';
import { CircleAlert, Upload } from 'lucide-react';

export default function FileDropZone({ id, label, hint, accept, onFile, error }) {
  const [isDragging, setIsDragging] = useState(false);
  const errorId = `${id}-error`;

  const choose = (files) => {
    if (files?.[0]) onFile(files[0]);
  };

  return (
    <div>
      <label
        htmlFor={id}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          choose(event.dataTransfer.files);
        }}
        className={`flex min-h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition-colors focus-within:border-primary focus-within:ring-3 focus-within:ring-mint ${
          isDragging ? 'border-primary bg-secondary' : 'border-line bg-white hover:border-mint'
        }`}
      >
        <Upload aria-hidden="true" className="size-7 text-primary" />
        <span className="font-bold text-ink">{label}</span>
        {hint && <span className="text-sm text-ink/80">{hint}</span>}
        <input
          id={id}
          type="file"
          accept={accept}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? errorId : undefined}
          onChange={(event) => {
            choose(event.target.files);
            event.target.value = '';
          }}
          className="sr-only"
        />
      </label>
      {error && (
        <p id={errorId} className="mt-1.5 flex items-start gap-1.5 text-sm font-medium text-danger">
          <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
