import type { AxisModuleConnection } from '../../../bootstrap/publicBootstrap';

export interface CoreDataImportConfiguration {
  readonly accessToken: string;
  readonly enterpriseCode: string;
  readonly modules: readonly string[];
  readonly timeoutMs: number;
}

export interface CoreDataImportResult {
  readonly code: string;
  readonly message: string;
}

function record(value: unknown, name: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${name} must be an object`);
  }
  return value as Record<string, unknown>;
}

function optionalText(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

async function safeError(response: Response): Promise<string> {
  try {
    const envelope = record(await response.json(), 'Core data error');
    const message = optionalText(envelope.message);
    if (message && message.length <= 500) return message;
  } catch {
    // Preserve the bounded HTTP fallback.
  }
  return response.status === 403
    ? 'You are not authorized to import core data.'
    : `Core data import returned HTTP ${String(response.status)}`;
}

export async function importCoreData(
  connection: AxisModuleConnection,
  configuration: CoreDataImportConfiguration,
  fetchImplementation: typeof fetch = fetch,
): Promise<CoreDataImportResult> {
  const modules = Array.from(
    new Set(
      configuration.modules.filter((moduleName) =>
        /^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(moduleName),
      ),
    ),
  ).sort();
  if (modules.length === 0) {
    throw new Error('No active modules are available for core data import');
  }
  const endpoint = new URL(connection.endpoint);
  if (!['http:', 'https:'].includes(endpoint.protocol)) {
    throw new Error('System endpoint is invalid');
  }
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(
    () => controller.abort(),
    configuration.timeoutMs,
  );
  try {
    const response = await fetchImplementation(
      new URL('/nodics/system/v0/import/core', endpoint),
      {
        method: 'POST',
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
        body: JSON.stringify({ modules }),
      },
    );
    if (!response.ok) throw new Error(await safeError(response));
    const envelope = record(await response.json(), 'Core data response');
    return Object.freeze({
      code: optionalText(envelope.code) ?? 'CORE_DATA_IMPORT_COMPLETED',
      message:
        optionalText(envelope.message) ??
        'Core data import completed. Sign out and sign in again to refresh permissions.',
    });
  } catch (error: unknown) {
    if (controller.signal.aborted) throw new Error('Core data import timed out');
    throw error instanceof Error ? error : new Error('Core data import failed');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}
