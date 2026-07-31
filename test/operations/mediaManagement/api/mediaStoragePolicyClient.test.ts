import { describe, expect, it, vi } from 'vitest';

import type { AxisModuleConnection } from '../../../../src/bootstrap/publicBootstrap';
import {
  loadMediaFolderUploadPolicies,
  loadMediaSourceContexts,
} from '../../../../src/operations/mediaManagement/api/mediaStoragePolicyClient';

const connection: AxisModuleConnection = {
  moduleName: 'media',
  instanceId: 'local:monoServer:media:1',
  endpoint: 'http://localhost:3000/nodics/media',
  environment: 'startioLocal',
  state: 'UP',
};

const configuration = {
  accessToken: 'employee-token',
  enterpriseCode: 'default',
  timeoutMs: 1000,
};

function response(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('media storage policy client', () => {
  it('loads backend-owned media source contexts without exposing storage internals', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockResolvedValue(
      response({
        data: {
          contexts: [
            {
              code: 'contentMedia',
              label: 'Content media',
              description: 'CMS assets',
              folderCodes: ['cmsAssets'],
              defaultFolderCode: 'cmsAssets',
              allowedFolders: [
                {
                  folderCode: 'cmsAssets',
                  storagePrefix: 'media/content',
                  access: 'PUBLIC',
                  retentionDays: 0,
                  storageKey: 'must-not-be-used',
                  fullPath: '/must/not/be/used',
                  uploadPolicy: {
                    maximumFileSizeBytes: 52428800,
                    allowedExtensions: ['png', 'webp'],
                    allowedMimeTypes: ['image/png', 'image/webp'],
                    checksumAlgorithm: 'sha256',
                  },
                },
              ],
              allowedFormatCodes: ['original', 'desktop'],
              defaultFormatCode: 'original',
              defaultModuleName: 'cms',
              defaultSchemaName: 'cmsComponent',
              targetRequired: false,
              manualUploadEnabled: true,
              storageRouteTemplate: 'media/content/{mediaCode}.{extension}',
            },
          ],
        },
      }),
    );

    const result = await loadMediaSourceContexts(
      connection,
      configuration,
      fetchImplementation,
    );

    expect((fetchImplementation.mock.calls[0]?.[0] as URL).pathname).toBe(
      '/nodics/media/v0/contexts',
    );
    expect(
      new Headers(fetchImplementation.mock.calls[0]?.[1]?.headers).get('Authorization'),
    ).toBe('Bearer employee-token');
    expect(result[0]?.label).toBe('Content media');
    expect(result[0]?.allowedFolders[0]?.maxFileSizeBytes).toBe(52428800);
    expect(JSON.stringify(result)).not.toContain('must-not-be-used');
    expect(JSON.stringify(result)).not.toContain('/must/not/be/used');
  });

  it('keeps folder-policy fallback compatible with backend maximumFileSizeBytes', async () => {
    const fetchImplementation = vi.fn<typeof fetch>().mockImplementation(() =>
      Promise.resolve(
        response({
          result: {
            folderCode: 'default',
            access: 'PRIVATE',
            uploadPolicy: {
              maximumFileSizeBytes: 2048,
              allowedExtensions: ['pdf'],
              allowedMimeTypes: ['application/pdf'],
              checksumAlgorithm: 'sha256',
            },
          },
        }),
      ),
    );

    const result = await loadMediaFolderUploadPolicies(
      connection,
      configuration,
      fetchImplementation,
    );

    expect(result[0]?.maxFileSizeBytes).toBe(2048);
  });
});
