export interface EmployeeSession {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly loginId: string;
  readonly generation: number;
}

function tokenEnvelope(value: unknown): { authToken: string; refreshToken: string } {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Profile returned an invalid authentication response');
  }
  const result = (value as { result?: unknown }).result;
  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    throw new Error('Profile returned an invalid authentication result');
  }
  const { authToken, refreshToken } = result as Record<string, unknown>;
  if (
    typeof authToken !== 'string' ||
    authToken === '' ||
    typeof refreshToken !== 'string' ||
    refreshToken === ''
  ) {
    throw new Error('Profile did not return the required employee tokens');
  }
  return { authToken, refreshToken };
}

export async function authenticateEmployee(
  profileBaseUrl: string,
  enterpriseCode: string,
  loginId: string,
  password: string,
  timeoutMs: number,
  fetchImplementation: typeof fetch = fetch,
): Promise<EmployeeSession> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImplementation(
      new URL('/nodics/profile/v0/employee/authenticate', profileBaseUrl),
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'x-enterprise-code': enterpriseCode,
        },
        body: JSON.stringify({ loginId, password }),
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
      },
    );
    if (!response.ok) {
      throw new Error(
        response.status === 401
          ? 'The employee identifier or password is incorrect.'
          : `Profile authentication returned HTTP ${String(response.status)}`,
      );
    }
    const tokens = tokenEnvelope(await response.json());
    return Object.freeze({
      accessToken: tokens.authToken,
      refreshToken: tokens.refreshToken,
      loginId,
      generation: Date.now(),
    });
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function logoutEmployee(
  profileBaseUrl: string,
  session: EmployeeSession,
  timeoutMs: number,
  fetchImplementation: typeof fetch = fetch,
): Promise<void> {
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetchImplementation(
      new URL('/nodics/profile/v0/token/logout', profileBaseUrl),
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${session.accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refreshToken: session.refreshToken }),
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
      },
    );
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
