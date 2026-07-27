import type { AxisModuleConnection } from '../../../bootstrap/publicBootstrap';
import type {
  DataRelease,
  DataReleaseOperationResult,
  DataReleasePlan,
  DataReleaseStatus,
  DataReleaseType,
  ImportRunSummary,
} from './dataReleaseContracts';

export interface DataReleaseClientConfiguration {
  readonly accessToken: string;
  readonly enterpriseCode: string;
  readonly timeoutMs: number;
}

const types = new Set<DataReleaseType>(['init', 'core', 'sample']);
const statuses = new Set<DataReleaseStatus>([
  'NOT_INSTALLED',
  'CURRENT',
  'UPDATE_AVAILABLE',
  'DOWNGRADE_AVAILABLE',
  'INVALID_RELEASE',
  'RUNNING',
  'FAILED',
]);

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} is invalid`);
  }
  return value as Record<string, unknown>;
}

function text(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim())
    throw new Error(`${label} is invalid`);
  return value.trim();
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function parseRelease(value: unknown): DataRelease {
  const source = record(value, 'Data release');
  const dataType = text(source.dataType, 'Data release type') as DataReleaseType;
  const status = text(source.status, 'Data release status') as DataReleaseStatus;
  if (!types.has(dataType) || !statuses.has(status))
    throw new Error('Data release is incompatible');
  const release: DataRelease = {
    moduleName: text(source.moduleName, 'Module name'),
    displayName: text(source.displayName, 'Module display name'),
    canonicalIdentity: text(source.canonicalIdentity, 'Canonical identity'),
    dataType,
    version: text(source.version, 'Release version'),
    description: optionalText(source.description) ?? '',
    checksum: text(source.checksum, 'Release checksum'),
    status,
  };
  const optionalValues = {
    parentModule: optionalText(source.parentModule),
    installedVersion: optionalText(source.installedVersion),
    installedAt: optionalText(source.installedAt),
    lastAttemptAt: optionalText(source.lastAttemptAt),
    lastRunId: optionalText(source.lastRunId),
  };
  return Object.freeze(
    Object.assign(
      release,
      Object.fromEntries(
        Object.entries(optionalValues).filter(
          ([, optionalValue]) => optionalValue !== undefined,
        ),
      ),
    ),
  );
}

function envelopeData(value: unknown): unknown {
  const envelope = record(value, 'Import response');
  if ('result' in envelope) return envelope.result;
  if ('data' in envelope) return envelope.data;
  throw new Error('Import response does not contain data');
}

async function safeError(response: Response): Promise<string> {
  try {
    const value = record(await response.json(), 'Import error');
    const message = optionalText(value.message);
    if (message && message.length <= 500) return message;
  } catch {
    // Preserve the bounded HTTP fallback.
  }
  if (response.status === 403)
    return 'You are not authorized to perform this import operation.';
  return `Import service returned HTTP ${String(response.status)}`;
}

async function request(
  connection: AxisModuleConnection,
  path: string,
  configuration: DataReleaseClientConfiguration,
  options: RequestInit = {},
  fetchImplementation: typeof fetch = fetch,
): Promise<unknown> {
  const endpoint = new URL(connection.endpoint);
  if (!['http:', 'https:'].includes(endpoint.protocol))
    throw new Error('Import endpoint is invalid');
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    configuration.timeoutMs,
  );
  try {
    const response = await fetchImplementation(
      new URL(`${endpoint.toString().replace(/\/$/, '')}/v0${path}`),
      {
        ...options,
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${configuration.accessToken}`,
          'Content-Type': 'application/json',
          'x-enterprise-code': configuration.enterpriseCode,
          ...options.headers,
        },
      },
    );
    if (!response.ok) throw new Error(await safeError(response));
    return envelopeData(await response.json());
  } catch (error: unknown) {
    if (controller.signal.aborted) throw new Error('Import request timed out');
    throw error instanceof Error ? error : new Error('Import request failed');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function loadDataReleases(
  connection: AxisModuleConnection,
  configuration: DataReleaseClientConfiguration,
  fetchImplementation: typeof fetch = fetch,
): Promise<readonly DataRelease[]> {
  const value = await request(
    connection,
    '/data-releases',
    configuration,
    {},
    fetchImplementation,
  );
  if (!Array.isArray(value)) throw new Error('Data release catalogue is invalid');
  return Object.freeze(value.map(parseRelease));
}

export async function preflightDataReleases(
  connection: AxisModuleConnection,
  configuration: DataReleaseClientConfiguration,
  plan: DataReleasePlan,
  fetchImplementation: typeof fetch = fetch,
): Promise<DataReleaseOperationResult> {
  return executeRequest(
    connection,
    '/data-releases/preflight',
    configuration,
    plan,
    fetchImplementation,
  );
}

export async function installDataReleases(
  connection: AxisModuleConnection,
  configuration: DataReleaseClientConfiguration,
  plan: DataReleasePlan,
  fetchImplementation: typeof fetch = fetch,
): Promise<DataReleaseOperationResult> {
  return executeRequest(
    connection,
    `/data-releases/${plan.dataType}/imports`,
    configuration,
    plan,
    fetchImplementation,
  );
}

export async function loadImportHistory(
  connection: AxisModuleConnection,
  configuration: DataReleaseClientConfiguration,
  fetchImplementation: typeof fetch = fetch,
): Promise<readonly ImportRunSummary[]> {
  const value = await request(
    connection,
    '/run/history?limit=50&skip=0',
    configuration,
    {},
    fetchImplementation,
  );
  if (!Array.isArray(value)) throw new Error('Import history is invalid');
  return Object.freeze(
    value.map((item) => {
      const source = record(item, 'Import run');
      const summary: ImportRunSummary = {
        runId: text(source.runId, 'Import run identifier'),
        status: text(source.status, 'Import run status'),
        modules: Object.freeze(
          Array.isArray(source.modules)
            ? source.modules.filter(
                (moduleName): moduleName is string =>
                  typeof moduleName === 'string' && moduleName.length <= 128,
              )
            : [],
        ),
      };
      const optionalValues = {
        dataType: optionalText(source.dataType),
        requestedBy: optionalText(source.requestedBy),
        createdAt: optionalText(source.createdAt),
      };
      return Object.freeze(
        Object.assign(
          summary,
          Object.fromEntries(
            Object.entries(optionalValues).filter(
              ([, optionalValue]) => optionalValue !== undefined,
            ),
          ),
        ),
      );
    }),
  );
}

async function executeRequest(
  connection: AxisModuleConnection,
  path: string,
  configuration: DataReleaseClientConfiguration,
  plan: DataReleasePlan,
  fetchImplementation: typeof fetch,
): Promise<DataReleaseOperationResult> {
  const value = record(
    await request(
      connection,
      path,
      configuration,
      { method: 'POST', body: JSON.stringify(plan) },
      fetchImplementation,
    ),
    'Data release operation',
  );
  const dataType = text(value.dataType, 'Data release type') as DataReleaseType;
  if (!types.has(dataType) || !Array.isArray(value.releases)) {
    throw new Error('Data release operation is incompatible');
  }
  const result: DataReleaseOperationResult = {
    dataType,
    tenant: text(value.tenant, 'Tenant'),
    releases: Object.freeze(value.releases.map(parseRelease)),
  };
  const importRun = optionalText(value.importRun);
  return Object.freeze(importRun ? { ...result, importRun } : result);
}
