import { useEffect, useRef } from 'react';

const ACTIVITY_EVENTS = [
  'keydown',
  'pointerdown',
  'pointermove',
  'touchstart',
  'wheel',
] as const;
const POINTER_MOVE_THROTTLE_MS = 1_000;

/**
 * Applies the authenticated BackOffice idle policy without persisting session
 * state. The backend owns the policy; Axis owns browser activity observation.
 */
export function useIdleScreenLock(
  enabled: boolean,
  idleTimeoutSeconds: number,
  onLock: () => void,
): void {
  const onLockRef = useRef(onLock);

  useEffect(() => {
    onLockRef.current = onLock;
  }, [onLock]);

  useEffect(() => {
    if (!enabled) return undefined;

    const timeoutMs = idleTimeoutSeconds * 1_000;
    let deadline = Date.now() + timeoutMs;
    let timer: ReturnType<typeof globalThis.setTimeout> | undefined;
    let lastPointerMove = 0;

    const schedule = () => {
      if (timer !== undefined) globalThis.clearTimeout(timer);
      const remaining = Math.max(0, deadline - Date.now());
      timer = globalThis.setTimeout(() => {
        if (Date.now() >= deadline) onLockRef.current();
        else schedule();
      }, remaining);
    };
    const recordActivity = (event: Event) => {
      if (
        event.type === 'pointermove' &&
        Date.now() - lastPointerMove < POINTER_MOVE_THROTTLE_MS
      ) {
        return;
      }
      if (event.type === 'pointermove') lastPointerMove = Date.now();
      deadline = Date.now() + timeoutMs;
      schedule();
    };
    const checkVisibility = () => {
      if (document.visibilityState === 'visible') {
        if (Date.now() >= deadline) onLockRef.current();
        else schedule();
      }
    };

    ACTIVITY_EVENTS.forEach((eventName) =>
      globalThis.addEventListener(eventName, recordActivity, { passive: true }),
    );
    document.addEventListener('visibilitychange', checkVisibility);
    schedule();

    return () => {
      if (timer !== undefined) globalThis.clearTimeout(timer);
      ACTIVITY_EVENTS.forEach((eventName) =>
        globalThis.removeEventListener(eventName, recordActivity),
      );
      document.removeEventListener('visibilitychange', checkVisibility);
    };
  }, [enabled, idleTimeoutSeconds]);
}
