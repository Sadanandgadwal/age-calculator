import { afterEach, describe, expect, it, vi } from 'vitest';
import { runInWorker } from './runInWorker.js';

const fakeWorker = () => ({ postMessage: vi.fn(), terminate: vi.fn() });

afterEach(() => vi.useRealTimers());

describe('runInWorker', () => {
  it('sends the request and returns the answer', () => {
    const worker = fakeWorker();
    const onDone = vi.fn();
    runInWorker(() => worker, 'job', {}, onDone);
    expect(worker.postMessage).toHaveBeenCalledWith('job');
    worker.onmessage({ data: { output: 1 } });
    expect(onDone).toHaveBeenCalledWith({ output: 1 });
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('stops a slow job with a message', () => {
    vi.useFakeTimers();
    const worker = fakeWorker();
    const onDone = vi.fn();
    runInWorker(() => worker, 'job', { timeoutMs: 100, timeoutMessage: 'Too slow' }, onDone);
    vi.advanceTimersByTime(100);
    expect(onDone).toHaveBeenCalledWith({ error: 'Too slow' });
    expect(worker.terminate).toHaveBeenCalled();
  });

  it('reports a worker failure', () => {
    const worker = fakeWorker();
    const onDone = vi.fn();
    runInWorker(() => worker, 'job', { errorMessage: 'Failed' }, onDone);
    worker.onerror();
    expect(onDone).toHaveBeenCalledWith({ error: 'Failed' });
  });

  it('can be cancelled, with no answer afterwards', () => {
    vi.useFakeTimers();
    const worker = fakeWorker();
    const onDone = vi.fn();
    const cancel = runInWorker(() => worker, 'job', { timeoutMs: 100 }, onDone);
    cancel();
    vi.advanceTimersByTime(200);
    expect(worker.terminate).toHaveBeenCalled();
    expect(onDone).not.toHaveBeenCalled();
  });
});
