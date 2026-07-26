import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

function renderPage() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <DocumentationRoutePage
        accessToken="token"
        channel="web"
        cmsBaseUrl="http://localhost:3000"
        connection={connection}
        locale="en"
        path="/docs"
        runtime={runtime}
        site="axisCmsSite"
      />
    </QueryClientProvider>,
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
    await user.click(screen.getByRole('button', { name: 'Import documentation' }));
    expect(fetchMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        pathname: '/nodics/system/v0/content-packs/nodicsDocumentation/imports',
      }),
      expect.objectContaining({ method: 'POST' }),
    );
    fetchMock.mockRestore();
  });
});
