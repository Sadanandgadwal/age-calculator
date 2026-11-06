import { useRef } from 'react';
import { cropFromKey, moveCrop, resizeCrop } from '../../utils/cropBox.js';
import BlobImage from './BlobImage.jsx';
import { CHECKERBOARD } from './imagePreview.js';

const HANDLES = [
  { id: 'nw', className: 'top-0 left-0 cursor-nwse-resize' },
  { id: 'ne', className: 'top-0 left-full cursor-nesw-resize' },
  { id: 'sw', className: 'top-full left-0 cursor-nesw-resize' },
  { id: 'se', className: 'top-full left-full cursor-nwse-resize' },
];

const percent = (value, total) => `${(value / total) * 100}%`;

export default function CropArea({ blob, imageWidth, imageHeight, crop, onChange, ratio, label = 'Crop area', children }) {
  const frame = useRef(null);
  const drag = useRef(null);

  const start = (event) => {
    const handle = event.target.closest('[data-handle]')?.dataset.handle ?? 'move';
    event.currentTarget.setPointerCapture?.(event.pointerId);
    event.currentTarget.focus();
    drag.current = { handle, x: event.clientX, y: event.clientY, crop, scale: imageWidth / frame.current.getBoundingClientRect().width };
    event.preventDefault();
  };

  const move = (event) => {
    const active = drag.current;
    if (!active) return;
    const dx = (event.clientX - active.x) * active.scale;
    const dy = (event.clientY - active.y) * active.scale;
    onChange(active.handle === 'move' ? moveCrop(active.crop, dx, dy, imageWidth, imageHeight) : resizeCrop(active.crop, active.handle, dx, dy, imageWidth, imageHeight, ratio));
  };

  const stop = () => {
    drag.current = null;
  };

  const onKeyDown = (event) => {
    const next = cropFromKey(crop, event.key, event.shiftKey, imageWidth, imageHeight, ratio);
    if (!next) return;
    event.preventDefault();
    onChange(next);
  };

  return (
    <div>
      <div ref={frame} style={CHECKERBOARD} className="relative touch-none overflow-hidden rounded-xl select-none">
        <BlobImage blob={blob} alt="" draggable={false} className="block w-full" />
        <div
          role="application"
          tabIndex={0}
          aria-label={`${label}. Drag to move, or drag a corner to resize. With the keyboard, use the arrow keys to move and Shift with the arrow keys to resize.`}
          data-testid="crop-box"
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
          onKeyDown={onKeyDown}
          style={{ left: percent(crop.x, imageWidth), top: percent(crop.y, imageHeight), width: percent(crop.width, imageWidth), height: percent(crop.height, imageHeight) }}
          className="absolute cursor-move shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] ring-2 ring-white outline-none focus-visible:ring-4 focus-visible:ring-mint"
        >
          {children}
          {HANDLES.map((handle) => (
            <span key={handle.id} data-handle={handle.id} aria-hidden="true" className={`absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center ${handle.className}`}>
              <span className="size-4 rounded-sm border-2 border-primary bg-white" />
            </span>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm font-medium text-ink/80">Drag the box or its corners. With the keyboard, use the arrow keys, and hold Shift to resize.</p>
    </div>
  );
}
