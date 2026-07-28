import { describe, expect, it, vi } from 'vitest';

import type { AxisModuleConnection } from '../../../../src/bootstrap/publicBootstrap';
import {
  installDataReleases,
  installMediaImport,
  loadDataReleases,
  loadImportDefinitions,
  loadImportHistory,
  preflightDataReleases,
  uploadImportMedia,
  validateMediaImport,
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
const mediaConnection: AxisModuleConnection = {
  moduleName: 'media',
  instanceId: 'local:monoServer:media:1',
  endpoint: 'http://localhost:3000/nodics/media',
  environment: 'startioLocal',
  state: 'UP',
};
const systemConnection: AxisModuleConnection = {
  moduleName: 'system',
  instanceId: 'local:monoServer:system:1',
  endpoint: 'http://localhost:3000/nodics/system',
  environment: 'startioLocal',
  state: 'UP',
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

  it('loads selectable import definitions from the import schema authority', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        result: [
          {
            code: 'profileTenantCsvImport',
            description: 'Imports tenant CSV records',
            moduleName: 'profile',
            schemaName: 'tenant',
            operation: 'saveAll',
            dataFilePrefix: 'defaultTenantCsvData',
            allowedExtensions: ['csv'],
            serverPath: '/must/not/pass',
          },
        ],
      }),
    );

    const result = await loadImportDefinitions(
      connection,
      configuration,
      fetchImplementation,
    );

    expect(result).toEqual([
      {
        code: 'profileTenantCsvImport',
        description: 'Imports tenant CSV records',
        moduleName: 'profile',
        schemaName: 'tenant',
        operation: 'saveAll',
        dataFilePrefix: 'defaultTenantCsvData',
        allowedExtensions: ['csv'],
      },
    ]);
    expect((fetchImplementation.mock.calls[0]?.[0] as URL).pathname).toBe(
      '/nodics/import/v0/importdefinition',
    );
    expect(fetchImplementation.mock.calls[0]?.[1]?.body).toContain('"active":true');
  });

  it('uploads import media without overriding the browser multipart boundary', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        result: {
          code: 'tenant-upload',
          name: 'tenant.csv',
          originalFileName: 'tenant.csv',
          extension: 'csv',
          sizeBytes: 32,
          checksum: 'b'.repeat(64),
          status: 'READY',
        },
      }),
    );
    const file = new File(['code,description\n'], 'tenant.csv', { type: 'text/csv' });

    const result = await uploadImportMedia(
      mediaConnection,
      configuration,
      file,
      fetchImplementation,
    );

    expect(result.mediaCode).toBe('tenant-upload');
    expect((fetchImplementation.mock.calls[0]?.[0] as URL).pathname).toBe(
      '/nodics/media/v0/storage/upload',
    );
    const headers = new Headers(fetchImplementation.mock.calls[0]?.[1]?.headers);
    expect(headers.get('Content-Type')).toBeNull();
    expect(fetchImplementation.mock.calls[0]?.[1]?.body).toBeInstanceOf(FormData);
  });

  it('validates and installs media imports through the system import route', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockImplementation(() =>
      Promise.resolve(
        response({
          code: 'SUC_IMP_00000',
          responseCode: '200',
          message: 'Data successfully processed',
          validationOnly: true,
          importRun: {
            runId: 'media-validation-1',
            status: 'VALIDATED',
            modules: ['profile'],
            summary: {
              recordsRead: 1,
              recordsFinalized: 1,
              recordsDispatched: 0,
              recordsSucceeded: 0,
            },
            stack: 'must not pass',
          },
          mediaSource: { mediaCode: 'tenant-upload', name: 'tenant.csv' },
          importDefinition: {
            code: 'generic_profile_tenant',
            description: 'Generic media import for profile/tenant',
            moduleName: 'profile',
            schemaName: 'tenant',
            dataFilePrefix: 'tenantImportData',
            allowedExtensions: [],
          },
        }),
      ),
    );

    await validateMediaImport(
      systemConnection,
      configuration,
      {
        mediaCode: 'tenant-upload',
        moduleName: 'profile',
        schemaName: 'tenant',
        operation: 'saveAll',
      },
      fetchImplementation,
    );
    const installResult = await installMediaImport(
      systemConnection,
      configuration,
      {
        mediaCode: 'tenant-upload',
        moduleName: 'profile',
        schemaName: 'tenant',
        operation: 'saveAll',
      },
      fetchImplementation,
    );

    expect(installResult.importRun?.runId).toBe('media-validation-1');
    expect(installResult.importRun?.summary?.recordsRead).toBe(1);
    expect(JSON.stringify(installResult)).not.toContain('stack');
    expect((fetchImplementation.mock.calls[0]?.[0] as URL).pathname).toBe(
      '/nodics/system/v0/import/media',
    );
    expect(fetchImplementation.mock.calls[0]?.[1]?.body).toContain(
      '"validateOnly":true',
    );
    expect(fetchImplementation.mock.calls[0]?.[1]?.body).toContain(
      '"moduleName":"profile"',
    );
    expect(fetchImplementation.mock.calls[0]?.[1]?.body).toContain(
      '"schemaName":"tenant"',
    );
    expect(fetchImplementation.mock.calls[0]?.[1]?.body).not.toContain(
      'definitionCode',
    );
    expect(fetchImplementation.mock.calls[1]?.[1]?.body).toContain(
      '"importFinalizeData":true',
    );
    expect(fetchImplementation.mock.calls[1]?.[1]?.body).not.toContain(
      'definitionCode',
    );
  });
});
