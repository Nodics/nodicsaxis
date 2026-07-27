import { describe, expect, it, vi } from 'vitest';

import type { AxisModuleConnection } from '../../../../src/bootstrap/publicBootstrap';
import {
  installDataReleases,
  loadDataReleases,
  loadImportHistory,
  preflightDataReleases,
} from '../../../../src/operations/importExport/api/dataReleaseClient';

const connection: AxisModuleConnection = {
  moduleName: 'import',
  instanceId: 'local:monoServer:default:1',
  endpoint: 'http://localhost:3000/nodics/import',
  environment: 'startioLocal',
  state: 'UP',
};
const configuration = {
  accessToken: 'employee-token',
  enterpriseCode: 'default',
  timeoutMs: 1000,
};
const release = {
  moduleName: 'profile',
  displayName: 'Employee Profiles',
  parentModule: 'gCore',
  canonicalIdentity: 'gCore/profile',
  dataType: 'core',
  version: '1.2.0',
  description: 'Profile baseline records',
  checksum: 'a'.repeat(64),
  status: 'UPDATE_AVAILABLE',
};

function response(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('data release client', () => {
  it('loads and parses the backend-owned catalogue', async () => {
    const fetchImplementation = vi
      .fn<typeof fetch>()
      .mockResolvedValue(response({ data: [release] }));

    const result = await loadDataReleases(
      connection,
      configuration,
      fetchImplementation,
    );

    expect(result[0]?.displayName).toBe('Employee Profiles');
    expect(result[0]?.status).toBe('UPDATE_AVAILABLE');
    const [url, options] = fetchImplementation.mock.calls[0]!;
    expect((url as URL).toString()).toBe(
      'http://localhost:3000/nodics/import/v0/data-releases',
    );
    expect(new Headers(options?.headers).get('Authorization')).toBe(
      'Bearer employee-token',
    );
  });

  it('sends the same immutable selection to preflight and typed execution', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockImplementation(() =>
      Promise.resolve(
        response({
          data: {
            dataType: 'core',
            tenant: 'default',
            releases: [release],
            importRun: 'run-1',
          },
        }),
      ),
    );
    const plan = {
      dataType: 'core' as const,
      modules: ['profile'],
      expectedReleases: { profile: '1.2.0' },
    };

    await preflightDataReleases(connection, configuration, plan, fetchImplementation);
    await installDataReleases(connection, configuration, plan, fetchImplementation);

    expect((fetchImplementation.mock.calls[0]?.[0] as URL).pathname).toBe(
      '/nodics/import/v0/data-releases/preflight',
    );
    expect((fetchImplementation.mock.calls[1]?.[0] as URL).pathname).toBe(
      '/nodics/import/v0/data-releases/core/imports',
    );
    expect(fetchImplementation.mock.calls[1]?.[1]?.body).toBe(JSON.stringify(plan));
  });

  it('rejects incompatible catalogue states and returns bounded authorization errors', async () => {
    await expect(
      loadDataReleases(
        connection,
        configuration,
        vi
          .fn<typeof fetch>()
          .mockResolvedValue(
            response({ data: [{ ...release, status: 'SECRET_STATE' }] }),
          ),
      ),
    ).rejects.toThrow('incompatible');

    await expect(
      loadDataReleases(
        connection,
        configuration,
        vi.fn<typeof fetch>().mockResolvedValue(response({}, 403)),
      ),
    ).rejects.toThrow('not authorized');
  });

  it('loads bounded import history without accepting diagnostic fields', async () => {
    const result = await loadImportHistory(
      connection,
      configuration,
      vi.fn<typeof fetch>().mockResolvedValue(
        response({
          data: [
            {
              runId: 'run-1',
              status: 'COMPLETED',
              dataType: 'core',
              modules: ['profile'],
              stack: 'must not pass',
            },
          ],
        }),
      ),
    );

    expect(result).toEqual([
      {
        runId: 'run-1',
        status: 'COMPLETED',
        dataType: 'core',
        modules: ['profile'],
      },
    ]);
    expect(JSON.stringify(result)).not.toContain('stack');
  });
});
