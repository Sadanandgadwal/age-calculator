export const SLOW_PATTERN_MESSAGE = 'This pattern took too long, so it was stopped. Please try a simpler one.';

export function runInWorker(createWorker, request, { timeoutMs = 2000, timeoutMessage = SLOW_PATTERN_MESSAGE, errorMessage = 'This could not be run. Please try again.' }, onDone) {
  const worker = createWorker();
  const stop = () => {
    clearTimeout(timer);
    worker.terminate();
  };
  const finish = (outcome) => {
    stop();
    onDone(outcome);
  };
  const timer = setTimeout(() => finish({ error: timeoutMessage }), timeoutMs);
  worker.onmessage = ({ data }) => finish(data);
  worker.onerror = () => finish({ error: errorMessage });
  worker.postMessage(request);
  return stop;
}
