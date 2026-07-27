import type { AxisModuleConnection } from '../../bootstrap/publicBootstrap';

const HTTP_METHODS = [
  'get',
  'post',
  'put',
  'patch',
  'delete',
  'head',
  'options',
  'trace',
] as const;
const MAXIMUM_OPERATIONS = 10_000;
const MAXIMUM_TEXT_LENGTH = 2_000;

export interface OpenApiOperation {
  readonly method: string;
  readonly path: string;
  readonly summary: string;
  readonly description: string;
  readonly tags: readonly string[];
}

export interface OpenApiReference {
  readonly title: string;
  readonly version: string;
  readonly operations: readonly OpenApiOperation[];
}

interface OpenApiClientOptions {
  readonly connection: AxisModuleConnection;
  readonly openApiPath: string;
  readonly enterpriseCode: string;
  readonly accessToken: string;
  readonly timeoutMs: number;
}

function record(value: unknown): Readonly<Record<string, unknown>> | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Readonly<Record<string, unknown>>)
    : undefined;
}

function boundedText(value: unknown, fallback = ''): string {
  return typeof value === 'string'
    ? value.trim().slice(0, MAXIMUM_TEXT_LENGTH)
    : fallback;
}

function parseOpenApiReference(value: unknown): OpenApiReference {
  const document = record(value);
  const info = record(document?.info);
  const paths = record(document?.paths);
  if (!document || !paths || !boundedText(document.openapi)) {
    throw new Error('OpenAPI service returned an incompatible contract');
  }

  const operations: OpenApiOperation[] = [];
  for (const [path, pathValue] of Object.entries(paths)) {
    const pathItem = record(pathValue);
    if (!pathItem) continue;
    for (const method of HTTP_METHODS) {
      const operation = record(pathItem[method]);
      if (!operation) continue;
      const tags = Array.isArray(operation.tags)
        ? operation.tags
            .map((tag) => boundedText(tag))
            .filter(Boolean)
            .slice(0, 20)
        : [];
      operations.push(
        Object.freeze({
          method: method.toUpperCase(),
          path: path.slice(0, MAXIMUM_TEXT_LENGTH),
          summary: boundedText(operation.summary, 'API operation'),
          description: boundedText(operation.description),
          tags: Object.freeze(tags),
        }),
      );
      if (operations.length >= MAXIMUM_OPERATIONS) break;
    }
    if (operations.length >= MAXIMUM_OPERATIONS) break;
  }

  return Object.freeze({
    title: boundedText(info?.title, 'Nodics API reference'),
    version: boundedText(info?.version, 'Current'),
    operations: Object.freeze(operations),
  });
}

export function createOpenApiClient(
  options: OpenApiClientOptions,
  fetchImplementation: typeof fetch = fetch,
) {
  return async (): Promise<OpenApiReference> => {
    const controller = new AbortController();
    const timeout = globalThis.setTimeout(() => controller.abort(), options.timeoutMs);
    const url = new URL(options.openApiPath, options.connection.endpoint);
    try {
      const response = await fetchImplementation(url, {
        headers: {
          Accept: 'application/json',
          Authorization: `Bearer ${options.accessToken}`,
          'x-enterprise-code': options.enterpriseCode,
        },
        cache: 'no-store',
        credentials: 'omit',
        redirect: 'error',
        signal: controller.signal,
      });
      if (!response.ok) {
        throw new Error(
          response.status === 403
            ? 'You are not authorized to view the API reference.'
            : `OpenAPI service returned HTTP ${String(response.status)}`,
        );
      }
      return parseOpenApiReference(await response.json());
    } catch (error: unknown) {
      if (controller.signal.aborted) {
        throw new Error('OpenAPI service request timed out');
      }
      throw error instanceof Error
        ? error
        : new Error('OpenAPI service request failed');
    } finally {
      globalThis.clearTimeout(timeout);
    }
  };
}
