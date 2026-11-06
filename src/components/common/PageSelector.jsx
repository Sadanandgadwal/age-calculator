import { useState } from 'react';
import { formatPageRanges, parsePageRanges } from '../../utils/pageRanges.js';
import CalculatorInput from './CalculatorInput.jsx';
import PdfPageGrid from './PdfPageGrid.jsx';

const smallButton =
  'inline-flex min-h-11 cursor-pointer items-center rounded-xl border-2 border-line bg-white px-3 text-sm font-bold text-primary outline-none hover:border-mint hover:bg-secondary focus-visible:ring-3 focus-visible:ring-mint';

export default function PageSelector({ id, label, pageCount, images, selected, onChange, rotations }) {
  const [text, setText] = useState(() => formatPageRanges([...selected]));
  const [error, setError] = useState();

  const apply = (indexes) => {
    onChange(new Set(indexes));
    setText(formatPageRanges(indexes));
    setError(undefined);
  };

  const changeText = (value) => {
    setText(value);
    if (!value.trim()) {
      onChange(new Set());
      setError(undefined);
      return;
    }
    const parsed = parsePageRanges(value, pageCount);
    setError(parsed.error);
    if (parsed.pages) onChange(new Set(parsed.pages));
  };

  const toggle = (index) => {
    const next = new Set(selected);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    apply([...next]);
  };

  return (
    <div className="flex flex-col gap-3">
      <CalculatorInput id={id} label={label} inputMode="text" placeholder="For example 1-3, 5" value={text} onChange={changeText} error={error} />
      <div className="flex flex-wrap gap-2">
        <button type="button" className={smallButton} onClick={() => apply(Array.from({ length: pageCount }, (_, index) => index))}>
          Select all
        </button>
        <button type="button" className={smallButton} onClick={() => apply([])}>
          Select none
        </button>
      </div>
      <PdfPageGrid label="Pages" pageCount={pageCount} images={images} selected={selected} onToggle={toggle} rotations={rotations} />
    </div>
  );
}
