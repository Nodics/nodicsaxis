import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { useIdleScreenLock } from '../../src/auth/useIdleScreenLock';

describe('useIdleScreenLock', () => {
  it('locks after the configured inactivity boundary', () => {
    vi.useFakeTimers();
    const lock = vi.fn();
    renderHook(() => useIdleScreenLock(true, 60, lock));

    act(() => {
      vi.advanceTimersByTime(59_999);
    });
    expect(lock).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(1);
    });
    expect(lock).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('resets the deadline for real employee activity and disables cleanly', () => {
    vi.useFakeTimers();
    const lock = vi.fn();
    const { rerender } = renderHook(
      ({ enabled }) => useIdleScreenLock(enabled, 60, lock),
      { initialProps: { enabled: true } },
    );

    act(() => {
      vi.advanceTimersByTime(45_000);
      globalThis.dispatchEvent(new Event('keydown'));
      vi.advanceTimersByTime(45_000);
    });
    expect(lock).not.toHaveBeenCalled();

    rerender({ enabled: false });
    act(() => {
      vi.advanceTimersByTime(60_000);
    });
    expect(lock).not.toHaveBeenCalled();
    vi.useRealTimers();
  });
});
