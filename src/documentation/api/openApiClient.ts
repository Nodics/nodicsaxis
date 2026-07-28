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
const MAXIMUM_ITEMS_PER_OPERATION = 100;
const MAXIMUM_TEXT_LENGTH = 2_000;

export interface OpenApiSchemaSummary {
  readonly label: string;
}

export interface OpenApiParameter {
  readonly name: string;
  readonly location: string;
  readonly required: boolean;
  readonly description: string;
  readonly schema?: OpenApiSchemaSummary | undefined;
}

export interface OpenApiRequestBody {
  readonly required: boolean;
  readonly description: string;
  readonly contentTypes: readonly string[];
  readonly schema?: OpenApiSchemaSummary | undefined;
}

export interface OpenApiResponse {
  readonly statusCode: string;
  readonly description: string;
  readonly contentTypes: readonly string[];
  readonly schema?: OpenApiSchemaSummary | undefined;
}

export interface OpenApiOperation {
  readonly operationId?: string | undefined;
  readonly method: string;
  readonly path: string;
  readonly summary: string;
  readonly description: string;
  readonly tags: readonly string[];
  readonly parameters: readonly OpenApiParameter[];
  readonly requestBody?: OpenApiRequestBody | undefined;
  readonly responses: readonly OpenApiResponse[];
  readonly security: readonly string[];
  readonly moduleName?: string | undefined;
  readonly routerGroup?: string | undefined;
  readonly schemaName?: string | undefined;
  readonly source?: string | undefined;
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

function optionalBoundedText(value: unknown): string | undefined {
  const candidate = boundedText(value);
  return candidate === '' ? undefined : candidate;
}

function booleanValue(value: unknown): boolean {
  return value === true;
}

function schemaSummary(value: unknown): OpenApiSchemaSummary | undefined {
  const schema = record(value);
  if (!schema) return undefined;
  const reference = optionalBoundedText(schema.$ref);
  if (reference) {
    return Object.freeze({ label: reference.split('/').at(-1) ?? reference });
  }
  const type = optionalBoundedText(schema.type);
  const format = optionalBoundedText(schema.format);
  if (type === 'array') {
    const itemSummary = schemaSummary(schema.items);
    return Object.freeze({
      label: itemSummary ? `array of ${itemSummary.label}` : 'array',
    });
  }
  if (type) {
    return Object.freeze({ label: format ? `${type} (${format})` : type });
  }
  const properties = record(schema.properties);
  if (properties) {
    return Object.freeze({
      label: `object with ${String(Object.keys(properties).length)} properties`,
    });
  }
  return undefined;
}

function parseParameters(value: unknown): readonly OpenApiParameter[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value.slice(0, MAXIMUM_ITEMS_PER_OPERATION).flatMap((candidate) => {
      const parameter = record(candidate);
      const name = boundedText(parameter?.name);
      const location = boundedText(parameter?.in);
      if (!parameter || !name || !location) return [];
      return [
        Object.freeze({
          name,
          location,
          required: booleanValue(parameter.required),
          description: boundedText(parameter.description),
          schema: schemaSummary(parameter.schema),
        }),
      ];
    }),
  );
}

function contentTypeEntries(value: unknown): readonly {
  readonly contentType: string;
  readonly schema: OpenApiSchemaSummary | undefined;
}[] {
  const content = record(value);
  if (!content) return Object.freeze([]);
  return Object.freeze(
    Object.entries(content)
      .slice(0, MAXIMUM_ITEMS_PER_OPERATION)
      .map(([contentType, mediaType]) =>
        Object.freeze({
          contentType: contentType.slice(0, MAXIMUM_TEXT_LENGTH),
          schema: schemaSummary(record(mediaType)?.schema),
        }),
      ),
  );
}

function parseRequestBody(value: unknown): OpenApiRequestBody | undefined {
  const requestBody = record(value);
  if (!requestBody) return undefined;
  const entries = contentTypeEntries(requestBody.content);
  return Object.freeze({
    required: booleanValue(requestBody.required),
    description: boundedText(requestBody.description),
    contentTypes: Object.freeze(entries.map((entry) => entry.contentType)),
    schema: entries.find((entry) => entry.schema)?.schema,
  });
}

function parseResponses(value: unknown): readonly OpenApiResponse[] {
  const responses = record(value);
  if (!responses) return Object.freeze([]);
  return Object.freeze(
    Object.entries(responses)
      .slice(0, MAXIMUM_ITEMS_PER_OPERATION)
      .flatMap(([statusCode, responseValue]) => {
        const response = record(responseValue);
        if (!response) return [];
        const entries = contentTypeEntries(response.content);
        return [
          Object.freeze({
            statusCode: statusCode.slice(0, MAXIMUM_TEXT_LENGTH),
            description: boundedText(response.description, 'Response'),
            contentTypes: Object.freeze(entries.map((entry) => entry.contentType)),
            schema: entries.find((entry) => entry.schema)?.schema,
          }),
        ];
      }),
  );
}

function parseSecurity(value: unknown): readonly string[] {
  if (!Array.isArray(value)) return Object.freeze([]);
  return Object.freeze(
    value.slice(0, MAXIMUM_ITEMS_PER_OPERATION).flatMap((candidate) => {
      const requirement = record(candidate);
      if (!requirement) return [];
      return Object.keys(requirement)
        .map((key) => key.slice(0, MAXIMUM_TEXT_LENGTH))
        .filter(Boolean);
    }),
  );
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
      const nodicsMetadata = record(operation['x-nodics']);
      const tags = Array.isArray(operation.tags)
        ? operation.tags
            .map((tag) => boundedText(tag))
            .filter(Boolean)
            .slice(0, 20)
        : [];
      operations.push(
        Object.freeze({
          operationId: optionalBoundedText(operation.operationId),
          method: method.toUpperCase(),
          path: path.slice(0, MAXIMUM_TEXT_LENGTH),
          summary: boundedText(operation.summary, 'API operation'),
          description: boundedText(operation.description),
          tags: Object.freeze(tags),
          parameters: parseParameters(operation.parameters),
          requestBody: parseRequestBody(operation.requestBody),
          responses: parseResponses(operation.responses),
          security: parseSecurity(operation.security),
          moduleName: optionalBoundedText(nodicsMetadata?.moduleName),
          routerGroup: optionalBoundedText(nodicsMetadata?.routerGroup),
          schemaName: optionalBoundedText(nodicsMetadata?.schemaName),
          source: optionalBoundedText(nodicsMetadata?.source),
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
