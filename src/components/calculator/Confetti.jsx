import { useEffect, useRef } from 'react';
import { launchConfetti } from '../../utils/confetti.js';

/** Full-screen birthday confetti that never blocks clicks. A new `trigger` value replays it. */
export default function Confetti({ trigger }) {
  const canvasRef = useRef(null);

  useEffect(() => launchConfetti(canvasRef.current), [trigger]);

  return (
    <canvas
      ref={canvasRef}
      data-testid="confetti"
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 size-full print:hidden"
    />
  );
}
