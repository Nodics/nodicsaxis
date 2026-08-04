import type { AxisModuleConnection } from '../../../bootstrap/publicBootstrap';

export interface NotificationOperationsSummary {
  readonly bounded: boolean;
  readonly counts: Readonly<Record<string, number>>;
  readonly recovery: Readonly<Record<string, string>>;
  readonly windowHours: number;
}

function envelope(value: unknown): NotificationOperationsSummary {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Notification diagnostics returned an invalid response');
  const body = value as Record<string, unknown>;
  const result = (body.result ?? body.data) as NotificationOperationsSummary;
  if (!result || typeof result !== 'object' || Array.isArray(result.counts))
    throw new Error('Notification diagnostics response does not contain data');
  return result;
}

export async function loadNotificationOperations(
  connection: AxisModuleConnection,
  accessToken: string,
  enterpriseCode: string,
  timeoutMs: number,
  fetchImplementation: typeof fetch = fetch,
): Promise<NotificationOperationsSummary> {
  const endpoint = new URL(connection.endpoint);
  if (!['http:', 'https:'].includes(endpoint.protocol))
    throw new Error('Notification endpoint is invalid');
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImplementation(
      new URL(`${endpoint.toString().replace(/\/$/, '')}/v0/operations/diagnostics`),
      {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${accessToken}`,
          'x-enterprise-code': enterpriseCode,
        },
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
      },
    );
    if (!response.ok)
      throw new Error(
        `Notification diagnostics returned HTTP ${String(response.status)}`,
      );
    return envelope(await response.json());
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
