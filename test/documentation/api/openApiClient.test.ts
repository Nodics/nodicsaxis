import { describe, expect, it, vi } from 'vitest';

import { createOpenApiClient } from '../../../src/documentation/api/openApiClient';

const options = {
  connection: {
    moduleName: 'system',
    instanceId: 'mono/system',
    endpoint: 'http://localhost:3000',
    environment: 'startioLocal',
    state: 'UP' as const,
  },
  openApiPath: '/nodics/system/v0/contract/openapi',
  enterpriseCode: 'default',
  accessToken: 'employee-token',
  timeoutMs: 1_000,
};

describe('openApiClient', () => {
  it('parses bounded operations from the authoritative OpenAPI contract', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(
        JSON.stringify({
          openapi: '3.0.3',
          info: { title: 'Nodics APIs', version: '1.0.0' },
          paths: {
            '/employees': {
              get: {
                summary: 'List employees',
                description: 'Returns authorized employee records.',
                tags: ['profile'],
              },
            },
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } },
      ),
    );

    const reference = await createOpenApiClient(options, fetchMock)();

    expect(reference).toEqual({
      title: 'Nodics APIs',
      version: '1.0.0',
      operations: [
        {
          method: 'GET',
          path: '/employees',
          summary: 'List employees',
          description: 'Returns authorized employee records.',
          tags: ['profile'],
        },
      ],
    });
    const [requestUrl, requestOptions] = fetchMock.mock.calls[0] ?? [];
    expect(requestUrl).toBeInstanceOf(URL);
    expect(requestUrl instanceof URL ? requestUrl.href : '').toBe(
      'http://localhost:3000/nodics/system/v0/contract/openapi',
    );
    expect(requestOptions?.headers).toMatchObject({
      Authorization: 'Bearer employee-token',
      'x-enterprise-code': 'default',
    });
  });

  it('rejects an incompatible document instead of rendering untrusted content', async () => {
    const fetchMock = vi.fn<typeof fetch>().mockResolvedValue(
      new Response(JSON.stringify({ paths: {} }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    await expect(createOpenApiClient(options, fetchMock)()).rejects.toThrow(
      'incompatible contract',
    );
  });
});
