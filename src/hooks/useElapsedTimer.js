import { useEffect, useRef, useState } from 'react';

const STOPPED = { base: 0, startedAt: null, now: 0 };

export function useElapsedTimer({ clock = Date.now, tickMs = 200, limitMs = null, onLimit } = {}) {
  const [state, setState] = useState(STOPPED);
  const onLimitRef = useRef(onLimit);
  const { base, startedAt, now } = state;
  const isRunning = startedAt !== null;

  useEffect(() => {
    onLimitRef.current = onLimit;
  });

  useEffect(() => {
    if (!isRunning) return undefined;

    const interval = setInterval(() => {
      const time = clock();
      if (limitMs !== null && base + time - startedAt >= limitMs) {
        clearInterval(interval);
        setState({ base: limitMs, startedAt: null, now: time });
        onLimitRef.current?.();
      } else {
        setState((current) => ({ ...current, now: time }));
      }
    }, tickMs);

    return () => clearInterval(interval);
  }, [isRunning, base, startedAt, limitMs, tickMs, clock]);

  return {
    elapsedMs: isRunning ? base + now - startedAt : base,
    isRunning,
    hasStarted: isRunning || base > 0,
    read: () => (isRunning ? base + clock() - startedAt : base),
    start: () => {
      const time = clock();
      setState((current) => (current.startedAt === null ? { ...current, startedAt: time, now: time } : current));
    },
    pause: () => {
      const time = clock();
      setState((current) =>
        current.startedAt === null ? current : { base: current.base + time - current.startedAt, startedAt: null, now: time },
      );
    },
    reset: () => setState(STOPPED),
  };
}
