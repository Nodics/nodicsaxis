import type { AxisModuleConnection } from '../../../bootstrap/publicBootstrap';

export interface ComplianceOperationsSummary {
  readonly bounded: boolean;
  readonly cases: Readonly<Record<string, number>>;
  readonly reviews: Readonly<Record<string, number>>;
  readonly sla: { readonly overdue: number };
  readonly providers: readonly {
    readonly providerCode: string;
    readonly healthStatus: string;
    readonly productionReady: boolean;
    readonly status: string;
  }[];
  readonly executionAttempts: Readonly<Record<string, number>>;
}

function envelope(value: unknown): ComplianceOperationsSummary {
  if (!value || typeof value !== 'object' || Array.isArray(value))
    throw new Error('Compliance dashboard returned an invalid response');
  const body = value as Record<string, unknown>;
  const result = (body.result ?? body.data) as ComplianceOperationsSummary;
  if (!result || typeof result !== 'object')
    throw new Error('Compliance dashboard response does not contain data');
  return result;
}

export async function loadComplianceOperations(
  connection: AxisModuleConnection,
  accessToken: string,
  enterpriseCode: string,
  timeoutMs: number,
  fetchImplementation: typeof fetch = fetch,
): Promise<ComplianceOperationsSummary> {
  const endpoint = new URL(connection.endpoint);
  if (!['http:', 'https:'].includes(endpoint.protocol))
    throw new Error('Compliance endpoint is invalid');
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetchImplementation(
      new URL(`${endpoint.toString().replace(/\/$/, '')}/v0/management/dashboard`),
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
      throw new Error(`Compliance dashboard returned HTTP ${String(response.status)}`);
    return envelope(await response.json());
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
