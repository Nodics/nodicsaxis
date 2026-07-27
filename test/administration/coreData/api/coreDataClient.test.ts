import { describe, expect, it } from 'vitest';

import { importCoreData } from '../../../../src/administration/coreData/api/coreDataClient';

const connection = {
  moduleName: 'system',
  instanceId: 'system_monoServer_monoNode0',
  environment: 'startioLocal',
  endpoint: 'http://localhost:3000/nodics/system',
  state: 'UP' as const,
};

describe('coreDataClient', () => {
  it('uses the existing secured System core-import contract', async () => {
    let requestedUrl: string | undefined;
    let requestedInit: RequestInit | undefined;
    const fetchImplementation: typeof fetch = (input, init) => {
      requestedUrl =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;
      requestedInit = init;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            code: 'SUC_IMP_00000',
            message: 'Core data imported',
          }),
          { status: 200, headers: { 'Content-Type': 'application/json' } },
        ),
      );
    };

    await expect(
      importCoreData(
        connection,
        {
          accessToken: 'employee-token',
          enterpriseCode: 'default',
          modules: ['profile', 'backoffice'],
          timeoutMs: 500,
        },
        fetchImplementation,
      ),
    ).resolves.toEqual({
      code: 'SUC_IMP_00000',
      message: 'Core data imported',
    });

    expect(requestedUrl).toBe('http://localhost:3000/nodics/system/v0/import/core');
    expect(requestedInit?.body).toBe(
      JSON.stringify({ modules: ['backoffice', 'profile'] }),
    );
    expect(requestedInit?.method).toBe('POST');
    expect(requestedInit?.credentials).toBe('omit');
    const requestedHeaders = new Headers(requestedInit?.headers);
    expect(requestedHeaders.get('Authorization')).toBe('Bearer employee-token');
    expect(requestedHeaders.get('x-enterprise-code')).toBe('default');
  });

  it('returns a safe authorization error without backend diagnostics', async () => {
    const fetchImplementation: typeof fetch = () =>
      Promise.resolve(new Response(null, { status: 403 }));

    await expect(
      importCoreData(
        connection,
        {
          accessToken: 'employee-token',
          enterpriseCode: 'default',
          modules: ['profile'],
          timeoutMs: 500,
        },
        fetchImplementation,
      ),
    ).rejects.toThrow('You are not authorized to import core data.');
  });
});
