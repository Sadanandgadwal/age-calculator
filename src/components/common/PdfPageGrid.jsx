import { useRef } from 'react';
import { ArrowLeft, ArrowRight, Check } from 'lucide-react';

const moveButton =
  'grid size-11 cursor-pointer place-items-center rounded-lg border-2 border-line bg-white text-primary outline-none hover:border-mint focus-visible:ring-3 focus-visible:ring-mint disabled:cursor-not-allowed disabled:opacity-40';

function Thumbnail({ image, pageNumber, rotation = 0 }) {
  return (
    <span className="grid aspect-[3/4] w-full place-items-center overflow-hidden rounded-lg bg-white">
      {image ? (
        <img src={image} alt="" style={{ transform: `rotate(${rotation}deg)` }} className="max-h-full max-w-full border border-line transition-transform" />
      ) : (
        <span className="text-xs font-bold text-ink/60">Page {pageNumber}</span>
      )}
    </span>
  );
}

export default function PdfPageGrid({ label, pageCount, images, selected, onToggle, rotations, order, onMove, onMoveTo }) {
  const dragFrom = useRef(null);
  const pages = order ?? Array.from({ length: pageCount }, (_, index) => index);

  return (
    <ol aria-label={label} className="grid grid-cols-3 gap-3 sm:grid-cols-4">
      {pages.map((pageIndex, position) => {
        const pageNumber = pageIndex + 1;
        const isSelected = selected?.has(pageIndex);
        return (
          <li
            key={pageIndex}
            draggable={Boolean(onMoveTo)}
            onDragStart={() => {
              dragFrom.current = position;
            }}
            onDragOver={(event) => onMoveTo && event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault();
              if (onMoveTo && dragFrom.current !== null && dragFrom.current !== position) onMoveTo(dragFrom.current, position);
              dragFrom.current = null;
            }}
            className="flex flex-col items-center gap-1"
          >
            {onToggle ? (
              <button
                type="button"
                aria-pressed={isSelected}
                aria-label={`Page ${pageNumber}`}
                onClick={() => onToggle(pageIndex)}
                className={`relative w-full cursor-pointer rounded-xl border-2 p-1.5 outline-none focus-visible:ring-3 focus-visible:ring-mint ${isSelected ? 'border-primary bg-secondary' : 'border-line bg-page hover:border-mint'}`}
              >
                <Thumbnail image={images[pageIndex]} pageNumber={pageNumber} rotation={rotations?.[pageIndex]} />
                {isSelected && (
                  <span className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-primary text-white">
                    <Check aria-hidden="true" className="size-4" />
                  </span>
                )}
              </button>
            ) : (
              <div className="w-full cursor-grab rounded-xl border-2 border-line bg-page p-1.5">
                <Thumbnail image={images[pageIndex]} pageNumber={pageNumber} rotation={rotations?.[pageIndex]} />
              </div>
            )}
            <span className="text-xs font-bold">Page {pageNumber}</span>
            {onMove && (
              <span className="flex gap-1">
                <button type="button" aria-label={`Move page ${pageNumber} earlier`} disabled={position === 0} onClick={() => onMove(position, -1)} className={moveButton}>
                  <ArrowLeft aria-hidden="true" className="size-4" />
                </button>
                <button type="button" aria-label={`Move page ${pageNumber} later`} disabled={position === pages.length - 1} onClick={() => onMove(position, 1)} className={moveButton}>
                  <ArrowRight aria-hidden="true" className="size-4" />
                </button>
              </span>
            )}
          </li>
        );
      })}
    </ol>
  );
}
