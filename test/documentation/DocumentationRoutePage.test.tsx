import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router';

import { DocumentationRoutePage } from '../../src/documentation/DocumentationRoutePage';

const runtime = {
  backofficeBaseUrl: 'http://localhost:3000',
  enterpriseCode: 'default',
  clientContractVersion: 1,
  requestTimeoutMs: 1_000,
  browserSessionCsrfCookieName: 'csrf',
  assistantMaximumEventBytes: 1_024,
  assistantReconnectWindowMs: 1_000,
  assistantIdleTimeoutMs: 1_000,
};
const connection = {
  moduleName: 'system',
  instanceId: 'mono/import',
  endpoint: 'http://localhost:3000',
  environment: 'startioLocal',
  state: 'UP' as const,
};
const bootstrap = {
  axisPolicy: {
    contractVersion: 1 as const,
    screenLockEnabled: true,
    idleTimeoutSeconds: 900,
    revision: 0,
    source: 'DEFAULT' as const,
  },
  navigation: [],
  environments: ['startioLocal'],
  moduleConnections: {
    system: [connection],
    cms: [{ ...connection, moduleName: 'cms' }],
  },
  documentationSources: [
    {
      id: 'framework',
      label: 'Framework',
      type: 'CMS' as const,
      route: '/docs/framework',
      order: 100,
      ownerModule: 'backoffice',
      connectionModule: 'system',
      site: 'axisCmsSite',
      catalog: 'nodicsDocumentationContentCatalog',
      defaultPage: '/docs',
      packCode: 'nodicsDocumentation',
    },
    {
      id: 'swaggers',
      label: 'Swaggers',
      type: 'OPENAPI' as const,
      route: '/docs/swaggers',
      order: 200,
      ownerModule: 'backoffice',
      connectionModule: 'system',
      openApiPath: '/nodics/system/v0/contract/openapi',
      swaggerPath: '/nodics/system/v0/contract/swagger',
    },
  ],
  tenantCode: 'default',
};
const response = {
  code: 'SUC_IMP_00000',
  data: {
    code: 'nodicsDocumentation',
    enabled: true,
    state: 'NOT_INSTALLED',
    available: true,
    installedVersion: null,
    availableVersion: '1.0.0',
    runId: null,
    allowedOperations: ['IMPORT'],
    presentation: {
      title: 'Nodics documentation',
      unavailableMessage: 'Install documentation to use the Wiki.',
      disabledMessage: 'Documentation is disabled.',
      importAction: 'Import documentation',
      updateAction: 'Update documentation',
      retryAction: 'Retry',
    },
  },
};

function renderPage(path = '/docs') {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <MemoryRouter initialEntries={[path]}>
      <QueryClientProvider client={queryClient}>
        <DocumentationRoutePage
          accessToken="token"
          bootstrap={bootstrap}
          channel="web"
          cmsBaseUrl="http://localhost:3000"
          locale="en"
          path={path}
          runtime={runtime}
        />
      </QueryClientProvider>
    </MemoryRouter>,
  );
}

describe('DocumentationRoutePage', () => {
  it('offers the governed import action when documentation is absent', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify(response), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    const user = userEvent.setup();
    renderPage();

    expect(
      await screen.findByText('Install documentation to use the Wiki.'),
    ).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Framework' })).toBeVisible();
    expect(screen.getByRole('tab', { name: 'Swaggers' })).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Import documentation' }));
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pathname: '/nodics/system/v0/content-packs/nodicsDocumentation/imports',
      }),
      expect.objectContaining({ method: 'POST' }),
    );
    fetchMock.mockRestore();
  });

  it('renders the backend-provided live OpenAPI source without embedding the protected Swagger page', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          openapi: '3.0.3',
          info: { title: 'Nodics APIs', version: '1.0.0' },
          paths: {
            '/nodics/profile/v0/employees': {
              get: {
                summary: 'List employees',
                tags: ['profile'],
              },
            },
          },
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        },
      ),
    );
    renderPage('/docs/swaggers');

    expect(await screen.findByText('Nodics APIs')).toBeVisible();
    expect(screen.getByText('/nodics/profile/v0/employees')).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Open interactive Swagger' }),
    ).toHaveAttribute(
      'href',
      'http://localhost:3000/nodics/system/v0/contract/swagger',
    );
    expect(screen.queryByTitle('Swaggers API documentation')).not.toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalled();
    const [requestUrl, requestOptions] = fetchMock.mock.calls[0] ?? [];
    expect(requestUrl).toBeInstanceOf(URL);
    expect(requestUrl instanceof URL ? requestUrl.href : '').toBe(
      'http://localhost:3000/nodics/system/v0/contract/openapi',
    );
    expect(requestOptions?.headers).toMatchObject({ Authorization: 'Bearer token' });
    fetchMock.mockRestore();
  });
});
