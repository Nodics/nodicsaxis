import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AxisThemeProvider } from '../../../src/app/AxisThemeProvider';
import type {
  AxisAuthenticatedBootstrap,
  AxisNavigationItem,
} from '../../../src/bootstrap/publicBootstrap';
import { MediaManagementRoutePage } from '../../../src/operations/mediaManagement/MediaManagementRoutePage';
import type { AxisRuntimeConfig } from '../../../src/runtime/runtimeConfig';
import type { WorkbenchSchema } from '../../../src/workbench/api/workbenchContracts';

const runtime: AxisRuntimeConfig = {
  backofficeBaseUrl: 'http://localhost:3000',
  enterpriseCode: 'default',
  clientContractVersion: 1,
  requestTimeoutMs: 1_000,
  browserSessionCsrfCookieName: 'csrf',
  assistantMaximumEventBytes: 1_024,
  assistantReconnectWindowMs: 1_000,
  assistantIdleTimeoutMs: 1_000,
};

const mediaConnection = {
  moduleName: 'media',
  instanceId: 'startioLocal:monoServer:media:0',
  endpoint: 'http://localhost:3000/nodics/media',
  environment: 'startioLocal',
  state: 'UP' as const,
};

function navigationItem(
  id: string,
  label: string,
  route: string,
  order: number,
  parentId?: string,
): AxisNavigationItem {
  return {
    id,
    label,
    route,
    order,
    parentId,
    moduleName: 'media',
    category: 'operations',
    icon: id === 'media-management' ? 'media' : 'storage',
    availability: 'UP',
    group: { id: 'media-management', label: 'Media Management', order: 250 },
  };
}

const bootstrap: AxisAuthenticatedBootstrap = {
  axisPolicy: {
    contractVersion: 1,
    screenLockEnabled: true,
    idleTimeoutSeconds: 900,
    revision: 1,
    source: 'DEFAULT',
  },
  navigation: [
    navigationItem('media-management', 'Media Management', '/media-management', 250),
    navigationItem(
      'media',
      'Media records',
      '/media-management/media',
      251,
      'media-management',
    ),
    navigationItem(
      'storage-delivery',
      'Storage and delivery',
      '/media-management/storage-delivery',
      252,
      'media-management',
    ),
    navigationItem(
      'media-folders',
      'Media folders',
      '/media-management/folders',
      253,
      'media-management',
    ),
  ],
  environments: ['startioLocal'],
  moduleCatalog: {},
  moduleConnections: {
    media: [mediaConnection],
  },
  documentationSources: [],
  tenantCode: 'default',
};

const mediaSchema: WorkbenchSchema = {
  moduleName: 'media',
  schemaName: 'media',
  label: 'Media',
  description: 'Media records',
  displayProperty: 'code',
  displayProperties: ['code', 'originalFileName'],
  queryCapabilities: {
    searchableFields: ['code', 'originalFileName', 'folderCode'],
    sortableFields: ['code'],
    filterFields: [],
    groupOperators: ['AND'],
    textOperator: 'CONTAINS',
    allowedPageSizes: [10, 25],
    defaultPageSize: 10,
    maximumPageSize: 25,
    defaultSort: { field: 'code', direction: 'ASC' },
  },
  mutationMode: 'GENERATED_CRUD',
  operations: ['search', 'read', 'update'],
  fields: [
    {
      name: 'code',
      label: 'Code',
      type: 'string',
      required: true,
      readOnly: false,
      primary: true,
      description: '',
      searchable: true,
    },
  ],
  relationships: [],
};

const mediaReferenceSchema: WorkbenchSchema = {
  ...mediaSchema,
  schemaName: 'mediaReference',
  label: 'Media reference',
  operations: ['search', 'read'],
};

const mediaFolderSchema: WorkbenchSchema = {
  ...mediaSchema,
  schemaName: 'mediaFolder',
  label: 'Media folder',
  displayProperties: ['code', 'name'],
  queryCapabilities: {
    ...mediaSchema.queryCapabilities,
    searchableFields: [
      'code',
      'name',
      'storagePrefix',
      'access',
      'allowedExtensions',
      'allowedMimeTypes',
    ],
  },
  operations: ['search', 'read'],
};

function json(result: unknown): Response {
  return new Response(JSON.stringify({ result }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function fetchInputUrl(input: RequestInfo | URL): URL {
  if (typeof input === 'string') return new URL(input);
  if (input instanceof URL) return input;
  return new URL(input.url);
}

function fetchBodyText(init?: RequestInit): string {
  const body = init?.body;
  if (body === undefined || body === null) return '{}';
  if (typeof body === 'string') return body;
  throw new TypeError('Expected test fetch body to be a JSON string.');
}

function renderPage(path = '/media-management/media') {
  const queryClient = new QueryClient({
    defaultOptions: { mutations: { retry: false }, queries: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AxisThemeProvider>
        <QueryClientProvider client={queryClient}>
          <MediaManagementRoutePage
            accessToken="employee-token"
            bootstrap={bootstrap}
            runtime={runtime}
          />
        </QueryClientProvider>
      </AxisThemeProvider>
    </MemoryRouter>,
  );
}

describe('MediaManagementRoutePage', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders media records through nMedia contracts without exposing storage keys', async () => {
    const user = userEvent.setup();
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation((input, init) => {
        const url = fetchInputUrl(input);
        if (url.pathname === '/nodics/media/v0/schema/workbench') {
          return Promise.resolve(
            json({
              moduleName: 'media',
              schemas: [mediaSchema, mediaReferenceSchema, mediaFolderSchema],
            }),
          );
        }
        if (url.pathname === '/nodics/media/v0/schema/workbench/media/records') {
          return Promise.resolve(
            json({
              records: [
                {
                  code: 'home-banner',
                  name: 'Home banner',
                  originalFileName: 'home-banner.png',
                  folderCode: 'brandAssets',
                  formatCode: 'desktop',
                  providerCode: 'local',
                  access: 'PUBLIC',
                  status: 'READY',
                  mimeType: 'image/png',
                  extension: 'png',
                  sizeBytes: 2048,
                  checksum: 'abc123',
                  checksumAlgorithm: 'sha256',
                  storageKey: 'private/internal/home-banner.png',
                  accessUrl: '/nodics/media/v0/content/home-banner',
                },
              ],
              totalCount: 1,
              pageNumber: 1,
              pageSize: 10,
              sort: { field: 'code', direction: 'ASC' },
            }),
          );
        }
        if (
          url.pathname === '/nodics/media/v0/schema/workbench/mediaReference/records'
        ) {
          return Promise.resolve(
            json({
              records: [],
              totalCount: 0,
              pageNumber: 1,
              pageSize: 10,
              sort: { field: 'code', direction: 'ASC' },
            }),
          );
        }
        if (url.pathname === '/nodics/media/v0/schema/workbench/mediaFolder/records') {
          return Promise.resolve(
            json({
              records: [
                {
                  code: 'cmsAssets',
                  name: 'CMS assets',
                  description: 'Content media folder',
                  storagePrefix: 'media/content',
                  access: 'PUBLIC',
                  allowedExtensions: ['png', 'webp'],
                  allowedMimeTypes: ['image/png', 'image/webp'],
                  maximumFileSizeBytes: 52428800,
                  retentionDays: 0,
                  fullPath: '/do/not/show/cms-assets',
                  providerSecret: 'must-not-render',
                },
              ],
              totalCount: 1,
              pageNumber: 1,
              pageSize: 10,
              sort: { field: 'code', direction: 'ASC' },
            }),
          );
        }
        if (url.pathname === '/nodics/media/v0/contexts') {
          return Promise.resolve(
            json({
              contexts: [
                {
                  code: 'contentMedia',
                  sourceType: 'Content media',
                  aliases: [
                    'contentMedia',
                    'cmsAssets',
                    'contentAssets',
                    'brandAssets',
                  ],
                  label: 'Content media',
                  description: 'Backend content media context',
                  folderCodes: ['brandAssets'],
                  defaultFolderCode: 'brandAssets',
                  allowedFolders: [
                    {
                      folderCode: 'brandAssets',
                      storagePrefix: 'media/content',
                      access: 'PUBLIC',
                      retentionDays: 0,
                      uploadPolicy: {
                        maximumFileSizeBytes: 4,
                        allowedExtensions: ['png'],
                        allowedMimeTypes: ['image/png'],
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
                  storageRouteTemplate:
                    'media/content/{tenant}/{enterprise}/{schema}/{yyyy}/{mm}/{mediaCode}.{extension}',
                },
              ],
            }),
          );
        }
        if (url.pathname === '/nodics/media/v0/storage/policy') {
          const body = JSON.parse(fetchBodyText(init)) as {
            readonly folderCode?: string;
          };
          return Promise.resolve(
            json({
              folderCode: body.folderCode ?? 'default',
              access: body.folderCode === 'cmsAssets' ? 'PUBLIC' : 'PRIVATE',
              uploadPolicy: {
                allowedExtensions: body.folderCode === 'cmsAssets' ? ['png'] : ['pdf'],
                allowedMimeTypes:
                  body.folderCode === 'cmsAssets' ? ['image/png'] : ['application/pdf'],
                checksumAlgorithm: 'sha256',
                maxFileSizeBytes: 52428800,
              },
            }),
          );
        }
        return Promise.resolve(json({}));
      });

    renderPage();

    await waitFor(() => {
      expect(screen.getAllByText('home-banner.png').length).toBeGreaterThan(0);
    });
    expect(screen.getByText('Content media')).toBeVisible();
    expect(screen.getByText('Visibility: PUBLIC')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Open through media delivery' }),
    ).toHaveAttribute(
      'href',
      'http://localhost:3000/nodics/media/v0/content/home-banner',
    );
    expect(screen.getByRole('link', { name: 'Download' })).toHaveAttribute(
      'href',
      'http://localhost:3000/nodics/media/v0/download/home-banner',
    );
    expect(screen.queryByText('Storage key')).not.toBeInTheDocument();
    expect(
      screen.queryByText('private/internal/home-banner.png'),
    ).not.toBeInTheDocument();

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input, init]) => {
          const url = fetchInputUrl(input);
          return url.pathname === '/nodics/media/v0/contexts' && init?.method === 'GET';
        }),
      ).toBe(true);
    });
    expect(
      fetchMock.mock.calls.some(([input]) => {
        const url = fetchInputUrl(input);
        return url.pathname === '/nodics/media/v0/storage/policy';
      }),
    ).toBe(false);
    expect(fetchMock).toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/nodics/media/v0/schema/workbench/media/records',
      }),
      expect.objectContaining({ method: 'POST' }),
    );
    const mediaRecordRequest = fetchMock.mock.calls.find(([input]) => {
      const url = fetchInputUrl(input);
      return url.pathname === '/nodics/media/v0/schema/workbench/media/records';
    });
    expect(JSON.parse(fetchBodyText(mediaRecordRequest?.[1]))).toEqual({
      search: '',
      pageNumber: 1,
      pageSize: 10,
      sort: { field: 'code', direction: 'ASC' },
    });

    const sourceTypeComboboxes = screen.getAllByRole('combobox', {
      name: 'Source type',
    });
    await user.click(sourceTypeComboboxes[sourceTypeComboboxes.length - 1]!);
    await user.click(await screen.findByRole('option', { name: 'Content media' }));
    const fileInput = document.querySelector('input[type="file"]');
    expect(fileInput).toBeInstanceOf(HTMLInputElement);
    await user.upload(
      fileInput as HTMLInputElement,
      new File(['oversized-media-content'], 'oversized.png', { type: 'image/png' }),
    );
    const uploadPolicyWarnings = await screen.findAllByText(
      /larger than the 4 B backend upload limit/i,
    );
    expect(uploadPolicyWarnings.length).toBeGreaterThan(0);
    expect(uploadPolicyWarnings[0]).toBeVisible();
    expect(screen.getByRole('button', { name: 'Upload to media' })).toBeDisabled();
  });

  it('shows media folder policy impact without exposing provider internals', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation((input) => {
      const url = fetchInputUrl(input);
      if (url.pathname === '/nodics/media/v0/schema/workbench') {
        return Promise.resolve(
          json({
            moduleName: 'media',
            schemas: [mediaSchema, mediaReferenceSchema, mediaFolderSchema],
          }),
        );
      }
      if (url.pathname === '/nodics/media/v0/schema/workbench/mediaFolder/records') {
        return Promise.resolve(
          json({
            records: [
              {
                code: 'cmsAssets',
                name: 'CMS assets',
                description: 'Content media folder',
                storagePrefix: 'media/content',
                access: 'PUBLIC',
                allowedExtensions: ['png', 'webp'],
                allowedMimeTypes: ['image/png', 'image/webp'],
                maximumFileSizeBytes: 52428800,
                retentionDays: 0,
                fullPath: '/do/not/show/cms-assets',
                providerSecret: 'must-not-render',
              },
            ],
            totalCount: 1,
            pageNumber: 1,
            pageSize: 10,
            sort: { field: 'code', direction: 'ASC' },
          }),
        );
      }
      if (url.pathname === '/nodics/media/v0/contexts') {
        return Promise.resolve(json({ contexts: [] }));
      }
      return Promise.resolve(json({}));
    });

    renderPage('/media-management/folders');

    expect((await screen.findAllByText('CMS assets')).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Folder policy affects future uploads for cmsAssets/i),
    ).toBeVisible();
    expect(
      screen.getByText(/nMedia uses this folder policy for upload validation/i),
    ).toBeVisible();
    expect(
      screen.getByText(/Editing is unavailable until nMedia exposes generated update/i),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Save folder policy' })).toBeDisabled();
    expect(
      screen.getByRole('link', {
        name: 'Open full folder record in Schema Workbench',
      }),
    ).toHaveAttribute('href', '/schema-workbench?module=media&schema=mediaFolder');
    expect(
      screen.queryByRole('link', { name: 'Create folder in Schema Workbench' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('/do/not/show/cms-assets')).not.toBeInTheDocument();
    expect(screen.queryByText('must-not-render')).not.toBeInTheDocument();
  });

  it('updates media folder policy only through generated schema mutations', async () => {
    const user = userEvent.setup();
    const editableMediaFolderSchema: WorkbenchSchema = {
      ...mediaFolderSchema,
      operations: ['search', 'read', 'create', 'update'],
    };
    const fetchMock = vi
      .spyOn(globalThis, 'fetch')
      .mockImplementation((input, init) => {
        const url = fetchInputUrl(input);
        if (url.pathname === '/nodics/media/v0/schema/workbench') {
          return Promise.resolve(
            json({
              moduleName: 'media',
              schemas: [mediaSchema, mediaReferenceSchema, editableMediaFolderSchema],
            }),
          );
        }
        if (url.pathname === '/nodics/media/v0/schema/workbench/mediaFolder/records') {
          return Promise.resolve(
            json({
              records: [
                {
                  code: 'cmsAssets',
                  name: 'CMS assets',
                  description: 'Content media folder',
                  storagePrefix: 'media/content',
                  access: 'PUBLIC',
                  allowedExtensions: ['png', 'webp'],
                  allowedMimeTypes: ['image/png', 'image/webp'],
                  maximumFileSizeBytes: 52428800,
                  retentionDays: 0,
                  fullPath: '/do/not/show/cms-assets',
                  providerSecret: 'must-not-render',
                },
              ],
              totalCount: 1,
              pageNumber: 1,
              pageSize: 10,
              sort: { field: 'code', direction: 'ASC' },
            }),
          );
        }
        if (
          url.pathname === '/nodics/media/v0/mediaFolder' &&
          init?.method === 'PATCH'
        ) {
          return Promise.resolve(
            json({
              models: [
                {
                  code: 'cmsAssets',
                  name: 'CMS assets',
                  storagePrefix: 'media/content',
                  access: 'SIGNED',
                  maximumFileSizeBytes: 1024,
                  retentionDays: 30,
                },
              ],
            }),
          );
        }
        if (url.pathname === '/nodics/media/v0/contexts') {
          return Promise.resolve(json({ contexts: [] }));
        }
        return Promise.resolve(json({}));
      });

    renderPage('/media-management/folders');

    expect((await screen.findAllByText('CMS assets')).length).toBeGreaterThan(0);
    expect(
      screen.getByText(/Axis submits folder policy changes through the generated/i),
    ).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Create folder in Schema Workbench' }),
    ).toHaveAttribute(
      'href',
      '/schema-workbench?module=media&schema=mediaFolder&mode=create',
    );

    await user.click(screen.getByRole('combobox', { name: 'Visibility' }));
    await user.click(await screen.findByRole('option', { name: 'SIGNED' }));
    await user.clear(screen.getByRole('spinbutton', { name: 'Maximum file size' }));
    await user.type(
      screen.getByRole('spinbutton', { name: 'Maximum file size' }),
      '1024',
    );
    await user.clear(screen.getByRole('spinbutton', { name: 'Retention days' }));
    await user.type(screen.getByRole('spinbutton', { name: 'Retention days' }), '30');
    await user.click(screen.getByRole('button', { name: 'Save folder policy' }));

    await waitFor(() => {
      expect(
        fetchMock.mock.calls.some(([input, init]) => {
          const url = fetchInputUrl(input);
          return (
            url.pathname === '/nodics/media/v0/mediaFolder' && init?.method === 'PATCH'
          );
        }),
      ).toBe(true);
    });
    const updateRequest = fetchMock.mock.calls.find(([input, init]) => {
      const url = fetchInputUrl(input);
      return (
        url.pathname === '/nodics/media/v0/mediaFolder' && init?.method === 'PATCH'
      );
    });
    expect(JSON.parse(fetchBodyText(updateRequest?.[1]))).toEqual({
      model: {
        access: 'SIGNED',
        maximumFileSizeBytes: 1024,
        retentionDays: 30,
      },
      options: { recursive: false, returnModified: true },
      query: { code: 'cmsAssets' },
    });
    expect(fetchMock).not.toHaveBeenCalledWith(
      expect.objectContaining({
        pathname: '/nodics/media/v0/storage/policy',
      }),
      expect.anything(),
    );
    expect(screen.queryByText('/do/not/show/cms-assets')).not.toBeInTheDocument();
    expect(screen.queryByText('must-not-render')).not.toBeInTheDocument();
  });
});
