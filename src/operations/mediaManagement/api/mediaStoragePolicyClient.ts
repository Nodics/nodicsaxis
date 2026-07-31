import type { AxisModuleConnection } from '../../../bootstrap/publicBootstrap';

export interface MediaStoragePolicyClientConfiguration {
  readonly accessToken: string;
  readonly enterpriseCode: string;
  readonly timeoutMs: number;
}

export interface MediaFolderPolicyProbe {
  readonly folderCode: string;
  readonly label: string;
  readonly fileName: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
}

export interface MediaFolderUploadPolicy {
  readonly folderCode: string;
  readonly label: string;
  readonly access: string;
  readonly allowedExtensions: readonly string[];
  readonly allowedMimeTypes: readonly string[];
  readonly checksumAlgorithm: string;
  readonly maxFileSizeBytes: number | undefined;
}

export interface MediaUploadInput {
  readonly file: File;
  readonly folderCode: string;
  readonly formatCode?: string;
  readonly moduleName?: string;
  readonly schemaName?: string;
  readonly name?: string;
  readonly description?: string;
}

export interface MediaUploadResult {
  readonly code: string;
  readonly name: string | undefined;
  readonly originalFileName: string | undefined;
  readonly folderCode: string | undefined;
  readonly formatCode: string | undefined;
  readonly access: string | undefined;
  readonly status: string | undefined;
  readonly mimeType: string | undefined;
  readonly extension: string | undefined;
  readonly sizeBytes: number | undefined;
  readonly accessUrl: string | undefined;
}

export const mediaFolderPolicyProbes: readonly MediaFolderPolicyProbe[] = Object.freeze(
  [
    Object.freeze({
      folderCode: 'importSources',
      label: 'Import source files',
      fileName: 'policy-probe.csv',
      mimeType: 'text/csv',
      sizeBytes: 1,
    }),
    Object.freeze({
      folderCode: 'exportFiles',
      label: 'Data export files',
      fileName: 'policy-probe.csv',
      mimeType: 'text/csv',
      sizeBytes: 1,
    }),
    Object.freeze({
      folderCode: 'cmsAssets',
      label: 'CMS content assets',
      fileName: 'policy-probe.png',
      mimeType: 'image/png',
      sizeBytes: 1,
    }),
    Object.freeze({
      folderCode: 'productAssets',
      label: 'Product media assets',
      fileName: 'policy-probe.png',
      mimeType: 'image/png',
      sizeBytes: 1,
    }),
    Object.freeze({
      folderCode: 'default',
      label: 'Utility files',
      fileName: 'policy-probe.pdf',
      mimeType: 'application/pdf',
      sizeBytes: 1,
    }),
  ],
);

function record(value: unknown, label: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${label} is invalid`);
  }
  return value as Record<string, unknown>;
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
    value.filter(
      (item): item is string => typeof item === 'string' && item.trim().length > 0,
    ),
  );
}

function envelopeData(value: unknown): unknown {
  const envelope = record(value, 'Media storage response');
  if ('result' in envelope) return envelope.result;
  if ('data' in envelope) return envelope.data;
  throw new Error('Media storage response does not contain data');
}

function parseFolderUploadPolicy(
  value: unknown,
  probe: MediaFolderPolicyProbe,
): MediaFolderUploadPolicy {
  const data = record(value, 'Media storage policy');
  const uploadPolicy = record(data.uploadPolicy, 'Media upload policy');
  return Object.freeze({
    folderCode: optionalText(data.folderCode) ?? probe.folderCode,
    label: probe.label,
    access: optionalText(data.access) ?? 'UNKNOWN',
    allowedExtensions: stringList(uploadPolicy.allowedExtensions),
    allowedMimeTypes: stringList(uploadPolicy.allowedMimeTypes),
    checksumAlgorithm: optionalText(uploadPolicy.checksumAlgorithm) ?? '—',
    maxFileSizeBytes: optionalNumber(uploadPolicy.maxFileSizeBytes),
  });
}

function parseMediaUploadResult(value: unknown): MediaUploadResult {
  const data = record(value, 'Media upload result');
  const code = optionalText(data.code);
  if (!code) throw new Error('Media upload response does not contain media code');
  return Object.freeze({
    code,
    name: optionalText(data.name),
    originalFileName: optionalText(data.originalFileName),
    folderCode: optionalText(data.folderCode),
    formatCode: optionalText(data.formatCode),
    access: optionalText(data.access),
    status: optionalText(data.status),
    mimeType: optionalText(data.mimeType),
    extension: optionalText(data.extension),
    sizeBytes: optionalNumber(data.sizeBytes),
    accessUrl: optionalText(data.accessUrl) ?? optionalText(data.url),
  });
}

async function safeError(response: Response): Promise<string> {
  try {
    const value = record(await response.json(), 'Media storage error');
    const message = optionalText(value.message);
    if (message && message.length <= 500) return message;
  } catch {
    // Preserve the bounded HTTP fallback.
  }
  return `Media storage policy returned HTTP ${String(response.status)}`;
}

async function requestPolicy(
  connection: AxisModuleConnection,
  configuration: MediaStoragePolicyClientConfiguration,
  probe: MediaFolderPolicyProbe,
  fetchImplementation: typeof fetch,
): Promise<MediaFolderUploadPolicy> {
  const endpoint = new URL(connection.endpoint);
  if (!['http:', 'https:'].includes(endpoint.protocol)) {
    throw new Error('Media endpoint is invalid');
  }
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    configuration.timeoutMs,
  );
  try {
    const response = await fetchImplementation(
      new URL(`${endpoint.toString().replace(/\/$/, '')}/v0/storage/policy`),
      {
        method: 'POST',
        body: JSON.stringify({
          fileName: probe.fileName,
          folderCode: probe.folderCode,
          mimeType: probe.mimeType,
          sizeBytes: probe.sizeBytes,
        }),
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${configuration.accessToken}`,
          'Content-Type': 'application/json',
          'x-enterprise-code': configuration.enterpriseCode,
        },
      },
    );
    if (!response.ok) throw new Error(await safeError(response));
    return parseFolderUploadPolicy(envelopeData(await response.json()), probe);
  } catch (error: unknown) {
    if (controller.signal.aborted)
      throw new Error('Media storage policy request timed out');
    throw error instanceof Error
      ? error
      : new Error('Media storage policy request failed');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function loadMediaFolderUploadPolicies(
  connection: AxisModuleConnection,
  configuration: MediaStoragePolicyClientConfiguration,
  fetchImplementation: typeof fetch = fetch,
): Promise<readonly MediaFolderUploadPolicy[]> {
  return Object.freeze(
    await Promise.all(
      mediaFolderPolicyProbes.map((probe) =>
        requestPolicy(connection, configuration, probe, fetchImplementation),
      ),
    ),
  );
}

export async function uploadMedia(
  connection: AxisModuleConnection,
  configuration: MediaStoragePolicyClientConfiguration,
  input: MediaUploadInput,
  fetchImplementation: typeof fetch = fetch,
): Promise<MediaUploadResult> {
  const endpoint = new URL(connection.endpoint);
  if (!['http:', 'https:'].includes(endpoint.protocol)) {
    throw new Error('Media endpoint is invalid');
  }
  if (!input.folderCode.trim()) {
    throw new Error('Media folder is required before upload');
  }
  const formData = new FormData();
  formData.append('file', input.file);
  formData.append('folderCode', input.folderCode);
  if (input.formatCode?.trim()) formData.append('formatCode', input.formatCode.trim());
  if (input.moduleName?.trim()) formData.append('moduleName', input.moduleName.trim());
  if (input.schemaName?.trim()) formData.append('schemaName', input.schemaName.trim());
  if (input.name?.trim()) formData.append('name', input.name.trim());
  if (input.description?.trim())
    formData.append('description', input.description.trim());

  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    configuration.timeoutMs,
  );
  try {
    const response = await fetchImplementation(
      new URL(`${endpoint.toString().replace(/\/$/, '')}/v0/storage/upload`),
      {
        method: 'POST',
        body: formData,
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
    return parseMediaUploadResult(envelopeData(await response.json()));
  } catch (error: unknown) {
    if (controller.signal.aborted) throw new Error('Media upload request timed out');
    throw error instanceof Error ? error : new Error('Media upload request failed');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
