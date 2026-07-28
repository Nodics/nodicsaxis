import type { AxisModuleConnection } from '../../../bootstrap/publicBootstrap';
import type {
  DataRelease,
  DataReleaseOperationResult,
  DataReleasePlan,
  DataReleaseStatus,
  DataReleaseType,
  ImportDefinitionSummary,
  ImportRunRecordSummary,
  MediaImportOperationResult,
  MediaUploadSummary,
  ImportRunSummary,
  GenericMediaImportRequest,
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

function optionalNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function stringList(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value
      .filter((item): item is string => typeof item === 'string' && item.trim() !== '')
      .map((item) => item.trim()),
  );
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

function parseImportRunSummary(value: unknown): ImportRunRecordSummary | undefined {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }
  const source = value as Record<string, unknown>;
  const summary: ImportRunRecordSummary = {};
  const optionalValues = {
    recordsRead: optionalNumber(source.recordsRead),
    recordsFinalized: optionalNumber(source.recordsFinalized),
    recordsDispatched: optionalNumber(source.recordsDispatched),
    recordsSucceeded: optionalNumber(source.recordsSucceeded),
    recordsFailed: optionalNumber(source.recordsFailed),
    recordsSkipped: optionalNumber(source.recordsSkipped),
    validationErrors: optionalNumber(source.validationErrors),
    totalRecordsHandled: optionalNumber(source.totalRecordsHandled),
  };
  if (Object.values(optionalValues).every((item) => item === undefined)) {
    return undefined;
  }
  return Object.freeze(
    Object.fromEntries(
      Object.entries(optionalValues).filter(([, item]) => item !== undefined),
    ),
  );
}

function parseImportRun(value: unknown): ImportRunSummary | undefined {
  if (typeof value === 'string' && value.trim()) {
    return Object.freeze({
      runId: value.trim(),
      status: 'UNKNOWN',
      modules: Object.freeze([]),
    });
  }
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }
  const source = record(value, 'Import run');
  const runId =
    optionalText(source.runId) ??
    optionalText(source.code) ??
    optionalText(source._id) ??
    'unknown';
  const summary: ImportRunSummary = {
    runId,
    status: optionalText(source.status) ?? 'UNKNOWN',
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
    summary: parseImportRunSummary(source.summary),
  };
  return Object.freeze(
    Object.assign(
      summary,
      Object.fromEntries(
        Object.entries(optionalValues).filter(([, item]) => item !== undefined),
      ),
    ),
  );
}

function envelopeData(value: unknown): unknown {
  const envelope = record(value, 'Import response');
  if ('result' in envelope) return envelope.result;
  if ('data' in envelope) return envelope.data;
  if ('code' in envelope || 'responseCode' in envelope) return envelope;
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

async function multipartRequest(
  connection: AxisModuleConnection,
  path: string,
  configuration: DataReleaseClientConfiguration,
  body: FormData,
  fetchImplementation: typeof fetch = fetch,
): Promise<unknown> {
  const endpoint = new URL(connection.endpoint);
  if (!['http:', 'https:'].includes(endpoint.protocol))
    throw new Error('Media endpoint is invalid');
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    configuration.timeoutMs,
  );
  try {
    const response = await fetchImplementation(
      new URL(`${endpoint.toString().replace(/\/$/, '')}/v0${path}`),
      {
        method: 'POST',
        body,
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${configuration.accessToken}`,
          'x-enterprise-code': configuration.enterpriseCode,
        },
      },
    );
    if (!response.ok) throw new Error(await safeError(response));
    return envelopeData(await response.json());
  } catch (error: unknown) {
    if (controller.signal.aborted) throw new Error('Media upload timed out');
    throw error instanceof Error ? error : new Error('Media upload failed');
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
      const importRun = parseImportRun(item);
      if (!importRun || importRun.runId === 'unknown')
        throw new Error('Import run identifier is invalid');
      return importRun;
    }),
  );
}

function parseImportDefinition(value: unknown): ImportDefinitionSummary {
  const source = record(value, 'Import definition');
  const definition: ImportDefinitionSummary = {
    code: text(source.code, 'Import definition code'),
    description: optionalText(source.description) ?? '',
    moduleName: text(source.moduleName, 'Import definition module'),
    dataFilePrefix: text(source.dataFilePrefix, 'Import definition data prefix'),
    allowedExtensions: stringList(source.allowedExtensions),
  };
  const optionalValues = {
    schemaName: optionalText(source.schemaName),
    indexName: optionalText(source.indexName),
    operation: optionalText(source.operation),
  };
  return Object.freeze(
    Object.assign(
      definition,
      Object.fromEntries(
        Object.entries(optionalValues).filter(([, item]) => item !== undefined),
      ),
    ),
  );
}

function parseMediaUpload(value: unknown): MediaUploadSummary {
  const source = record(value, 'Uploaded media');
  const media: MediaUploadSummary = {
    mediaCode: optionalText(source.mediaCode) ?? text(source.code, 'Media code'),
    name:
      optionalText(source.name) ??
      optionalText(source.originalFileName) ??
      'Uploaded file',
  };
  const optionalValues = {
    originalFileName: optionalText(source.originalFileName),
    extension: optionalText(source.extension),
    sizeBytes: optionalNumber(source.sizeBytes),
    checksum: optionalText(source.checksum),
    status: optionalText(source.status),
  };
  return Object.freeze(
    Object.assign(
      media,
      Object.fromEntries(
        Object.entries(optionalValues).filter(([, value]) => value !== undefined),
      ),
    ),
  );
}

export async function loadImportDefinitions(
  connection: AxisModuleConnection,
  configuration: DataReleaseClientConfiguration,
  fetchImplementation: typeof fetch = fetch,
): Promise<readonly ImportDefinitionSummary[]> {
  const value = await request(
    connection,
    '/importdefinition',
    configuration,
    {
      method: 'POST',
      body: JSON.stringify({
        query: { active: true, enabled: true },
        options: { recursive: false },
        searchOptions: { pageSize: 100, pageNumber: 1 },
      }),
    },
    fetchImplementation,
  );
  if (!Array.isArray(value)) throw new Error('Import definitions are invalid');
  return Object.freeze(value.map(parseImportDefinition));
}

export async function uploadImportMedia(
  connection: AxisModuleConnection,
  configuration: DataReleaseClientConfiguration,
  file: File,
  fetchImplementation: typeof fetch = fetch,
): Promise<MediaUploadSummary> {
  const body = new FormData();
  body.append('folderCode', 'importSources');
  body.append('formatCode', 'importFile');
  body.append('name', file.name);
  body.append('file', file);
  return parseMediaUpload(
    await multipartRequest(
      connection,
      '/storage/upload',
      configuration,
      body,
      fetchImplementation,
    ),
  );
}

export async function validateMediaImport(
  connection: AxisModuleConnection,
  configuration: DataReleaseClientConfiguration,
  requestBody: GenericMediaImportRequest,
  fetchImplementation: typeof fetch = fetch,
): Promise<MediaImportOperationResult> {
  return executeMediaImport(
    connection,
    configuration,
    { ...requestBody, options: { validateOnly: true }, validationOnly: true },
    fetchImplementation,
  );
}

export async function installMediaImport(
  connection: AxisModuleConnection,
  configuration: DataReleaseClientConfiguration,
  requestBody: GenericMediaImportRequest,
  fetchImplementation: typeof fetch = fetch,
): Promise<MediaImportOperationResult> {
  return executeMediaImport(
    connection,
    configuration,
    { ...requestBody, importFinalizeData: true },
    fetchImplementation,
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

async function executeMediaImport(
  connection: AxisModuleConnection,
  configuration: DataReleaseClientConfiguration,
  body: Record<string, unknown>,
  fetchImplementation: typeof fetch,
): Promise<MediaImportOperationResult> {
  const value = record(
    await request(
      connection,
      '/import/media',
      configuration,
      { method: 'POST', body: JSON.stringify(body) },
      fetchImplementation,
    ),
    'Media import operation',
  );
  const importDefinition =
    value.importDefinition === undefined
      ? undefined
      : parseImportDefinition(value.importDefinition);
  const mediaSource =
    value.mediaSource === undefined ? undefined : parseMediaUpload(value.mediaSource);
  const result: MediaImportOperationResult = {
    validationOnly: value.validationOnly === true,
  };
  const optionalValues = {
    importRun: parseImportRun(value.importRun),
    importDefinition,
    mediaSource,
  };
  return Object.freeze(
    Object.assign(
      result,
      Object.fromEntries(
        Object.entries(optionalValues).filter(([, item]) => item !== undefined),
      ),
    ),
  );
}
