const SCREEN_LOCK_STORAGE_KEY = 'nodics-axis-screen-lock-v1';
const DEFAULT_RETURN_PATH = '/dashboard';
const EXCLUDED_RETURN_PATHS = new Set(['/login', '/forgot-password', '/lock-screen']);

interface PersistedScreenLock {
  readonly locked: true;
  readonly returnPath: string;
}

function safeReturnPath(value: unknown): string {
  if (
    typeof value !== 'string' ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    value.length > 512 ||
    EXCLUDED_RETURN_PATHS.has(value)
  ) {
    return DEFAULT_RETURN_PATH;
  }
  return value;
}

/**
 * Persists only the browser presentation gate. Credentials, access tokens,
 * refresh tokens, employee data, and backend payloads must never be stored
 * here.
 */
export function persistScreenLock(
  returnPath: string,
  storage: Pick<Storage, 'setItem'> = window.sessionStorage,
): void {
  const state: PersistedScreenLock = {
    locked: true,
    returnPath: safeReturnPath(returnPath),
  };
  storage.setItem(SCREEN_LOCK_STORAGE_KEY, JSON.stringify(state));
}

export function restoreScreenLock(
  storage: Pick<Storage, 'getItem' | 'removeItem'> = window.sessionStorage,
): PersistedScreenLock | undefined {
  const encoded = storage.getItem(SCREEN_LOCK_STORAGE_KEY);
  if (!encoded) return undefined;
  try {
    const value = JSON.parse(encoded) as Record<string, unknown>;
    if (value.locked !== true) throw new Error('Screen lock marker is invalid');
    return { locked: true, returnPath: safeReturnPath(value.returnPath) };
  } catch {
    storage.removeItem(SCREEN_LOCK_STORAGE_KEY);
    return undefined;
  }
}

export function clearScreenLock(
  storage: Pick<Storage, 'removeItem'> = window.sessionStorage,
): void {
  storage.removeItem(SCREEN_LOCK_STORAGE_KEY);
}
