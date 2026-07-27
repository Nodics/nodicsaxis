import type { AxisModuleConnection } from '../../../bootstrap/publicBootstrap';
import {
  parseModuleHealthDetail,
  parseModuleHealthList,
  type ModuleHealthDetail,
  type ModuleHealthSummary,
} from './moduleHealthContracts';

export interface ModuleHealthClientConfiguration {
  readonly accessToken: string;
  readonly enterpriseCode: string;
  readonly timeoutMs: number;
}

function safeModuleName(value: string): string {
  if (!/^[A-Za-z][A-Za-z0-9_-]{0,127}$/.test(value)) {
    throw new Error('Module health module name is invalid');
  }
  return encodeURIComponent(value);
}

function envelopeData(value: unknown): unknown {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error('Module health returned an invalid response');
  }
  if ('result' in value) return (value as { readonly result: unknown }).result;
  if ('data' in value) return (value as { readonly data: unknown }).data;
  throw new Error('Module health response does not contain data');
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const value: unknown = await response.json();
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const message = (value as Record<string, unknown>).message;
      if (typeof message === 'string' && message.trim() && message.length <= 500) {
        return message;
      }
    }
  } catch {
    // Preserve the bounded HTTP fallback.
  }
  return `Module health request returned HTTP ${String(response.status)}`;
}

async function request(
  connection: AxisModuleConnection,
  path: string,
  configuration: ModuleHealthClientConfiguration,
  options: RequestInit = {},
  fetchImplementation: typeof fetch = fetch,
): Promise<unknown> {
  const endpoint = new URL(connection.endpoint);
  if (!['http:', 'https:'].includes(endpoint.protocol)) {
    throw new Error('BackOffice endpoint is invalid');
  }
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
          'x-enterprise-code': configuration.enterpriseCode,
          ...options.headers,
        },
      },
    );
    if (!response.ok) throw new Error(await errorMessage(response));
    return envelopeData(await response.json());
  } catch (error: unknown) {
    if (controller.signal.aborted) throw new Error('Module health request timed out');
    throw error instanceof Error ? error : new Error('Module health request failed');
  } finally {
    globalThis.clearTimeout(timeout);
  }
}

export async function loadModuleHealth(
  connection: AxisModuleConnection,
  configuration: ModuleHealthClientConfiguration,
  fetchImplementation: typeof fetch = fetch,
): Promise<readonly ModuleHealthSummary[]> {
  return parseModuleHealthList(
    await request(
      connection,
      '/registry/admin/modules?offset=0&limit=100',
      configuration,
      {},
      fetchImplementation,
    ),
  );
}

export async function loadModuleHealthDetail(
  connection: AxisModuleConnection,
  moduleName: string,
  configuration: ModuleHealthClientConfiguration,
  fetchImplementation: typeof fetch = fetch,
): Promise<ModuleHealthDetail> {
  return parseModuleHealthDetail(
    await request(
      connection,
      `/registry/admin/modules/${safeModuleName(moduleName)}`,
      configuration,
      {},
      fetchImplementation,
    ),
  );
}

export async function refreshModuleHealth(
  connection: AxisModuleConnection,
  moduleName: string,
  configuration: ModuleHealthClientConfiguration,
  fetchImplementation: typeof fetch = fetch,
): Promise<void> {
  await request(
    connection,
    `/registry/admin/modules/${safeModuleName(moduleName)}/refresh`,
    configuration,
    { method: 'POST' },
    fetchImplementation,
  );
}
