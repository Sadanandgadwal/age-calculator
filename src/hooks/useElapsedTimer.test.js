import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { useElapsedTimer } from './useElapsedTimer.js';

describe('useElapsedTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(0);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const advance = (ms) => act(() => vi.advanceTimersByTime(ms));

  it('starts stopped at zero', () => {
    const { result } = renderHook(() => useElapsedTimer());
    expect(result.current).toMatchObject({ elapsedMs: 0, isRunning: false, hasStarted: false });
  });

  it('measures elapsed time while running', () => {
    const { result } = renderHook(() => useElapsedTimer());
    act(() => result.current.start());
    advance(1000);
    expect(result.current.elapsedMs).toBe(1000);
    expect(result.current).toMatchObject({ isRunning: true, hasStarted: true });
  });

  it('uses timestamps, so delayed ticks do not lose time', () => {
    const { result } = renderHook(() => useElapsedTimer({ tickMs: 200 }));
    act(() => result.current.start());
    act(() => vi.setSystemTime(60000));
    advance(200);
    expect(result.current.elapsedMs).toBe(60200);
  });

  it('holds its value while paused and continues on resume', () => {
    const { result } = renderHook(() => useElapsedTimer());
    act(() => result.current.start());
    advance(1000);
    act(() => result.current.pause());
    advance(5000);
    expect(result.current.elapsedMs).toBe(1000);
    expect(result.current.isRunning).toBe(false);

    act(() => result.current.start());
    advance(1000);
    expect(result.current.elapsedMs).toBe(2000);
  });

  it('ignores a second start or pause', () => {
    const { result } = renderHook(() => useElapsedTimer());
    act(() => result.current.start());
    advance(1000);
    act(() => result.current.start());
    advance(1000);
    expect(result.current.elapsedMs).toBe(2000);
    act(() => result.current.pause());
    act(() => result.current.pause());
    expect(result.current.elapsedMs).toBe(2000);
  });

  it('resets', () => {
    const { result } = renderHook(() => useElapsedTimer());
    act(() => result.current.start());
    advance(1000);
    act(() => result.current.reset());
    expect(result.current).toMatchObject({ elapsedMs: 0, isRunning: false, hasStarted: false });
  });

  it('reads the exact time between ticks', () => {
    const { result } = renderHook(() => useElapsedTimer({ tickMs: 1000 }));
    act(() => result.current.start());
    act(() => vi.setSystemTime(450));
    expect(result.current.read()).toBe(450);
  });

  it('stops at its limit and reports it once', () => {
    const onLimit = vi.fn();
    const { result } = renderHook(() => useElapsedTimer({ limitMs: 1000, onLimit }));
    act(() => result.current.start());
    advance(3000);
    expect(result.current).toMatchObject({ elapsedMs: 1000, isRunning: false });
    expect(onLimit).toHaveBeenCalledOnce();
  });

  it('cleans up its interval when unmounted', () => {
    const { result, unmount } = renderHook(() => useElapsedTimer());
    act(() => result.current.start());
    unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
});
