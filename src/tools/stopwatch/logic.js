const pad = (value) => String(value).padStart(2, '0');

export function formatStopwatch(ms) {
  const centiseconds = Math.floor(Math.max(0, ms) / 10);
  const totalSeconds = Math.floor(centiseconds / 100);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${pad(hours)}:${pad(minutes)}:${pad(totalSeconds % 60)}.${pad(centiseconds % 100)}`;
}

export function addLap(laps, totalMs) {
  const previous = laps[0]?.totalMs ?? 0;
  return [{ number: laps.length + 1, lapMs: totalMs - previous, totalMs }, ...laps];
}

export const buildResultText = (laps) =>
  [...laps]
    .reverse()
    .map(({ number, lapMs, totalMs }) => `Lap ${number}: ${formatStopwatch(lapMs)} (total ${formatStopwatch(totalMs)})`)
    .join('\n');
