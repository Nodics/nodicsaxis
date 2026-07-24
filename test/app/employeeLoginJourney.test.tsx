import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { App } from '../../src/app/App';
import { AppProviders } from '../../src/app/AppProviders';
import { validResolvedPage } from '../cms/fixtures/resolvedPage';

const runtimeConfig = {
  backofficeBaseUrl: 'https://backoffice.example.com',
  enterpriseCode: 'enterprise-a',
  clientContractVersion: 1,
  requestTimeoutMs: 10_000,
};

const publicBootstrap = {
  data: {
    contractVersion: 1,
    clientContractVersion: 1,
    endpoints: {
      profile: 'https://profile.example.com',
      cms: 'https://cms.example.com',
    },
    uiComposition: {
      site: 'axisCmsSite',
      catalog: 'axisContentCatalog',
      defaultPublicPage: '/login',
      defaultAuthenticatedPage: '/dashboard',
      locale: 'en',
      channel: 'web',
      fallbackMode: 'STATIC_RECOVERY_SHELL',
    },
  },
};

const loginPage = {
  ...validResolvedPage,
  page: {
    ...validResolvedPage.page,
    components: [
      ...validResolvedPage.page.components,
      {
        code: 'axisEmployeeLoginFormComponent',
        typeCode: 'axisEmployeeLoginFormComponentType',
        renderer: 'axis.component.employee-login-form',
        rendererContractVersion: 1,
        rendererChannels: ['web'],
        rendererDeprecated: false,
        properties: {
          title: 'Employee sign in',
          usernameLabel: 'Employee ID',
          passwordLabel: 'Password',
          submitLabel: 'Sign in',
        },
        slot: 'authentication',
        index: 30,
        components: [],
      },
    ],
  },
};

const dashboardPage = {
  ...validResolvedPage,
  path: '/dashboard',
  page: {
    ...validResolvedPage.page,
    code: 'axisDashboardPage',
    typeCode: 'axisDashboardPageType',
    renderer: 'axis.page.dashboard',
    template: 'axisDashboardPageTemplate',
    templateContract: {
      code: 'axisDashboardPageTemplate',
      renderer: 'axis.template.dashboard',
      contractVersion: 1,
    },
    components: [
      {
        code: 'axisDashboardWelcomeComponent',
        typeCode: 'axisMessageComponentType',
        renderer: 'axis.component.message',
        rendererContractVersion: 1,
        rendererChannels: ['web'],
        rendererDeprecated: false,
        properties: {
          title: 'Axis dashboard',
          message: 'Authenticated employee workspace',
        },
        slot: 'welcome',
        index: 10,
        components: [],
      },
    ],
  },
};

describe('employee login journey', () => {
  it('discovers modules, authenticates through Profile, and protects dashboard', async () => {
    window.history.pushState({}, '', '/login');
    const request = vi.fn<typeof fetch>().mockImplementation((input, options) => {
      const url =
        typeof input === 'string'
          ? input
          : input instanceof URL
            ? input.href
            : input.url;
      if (url.includes('/bootstrap/public')) {
        return Promise.resolve(
          new Response(JSON.stringify(publicBootstrap), { status: 200 }),
        );
      }
      if (url.includes('/employee/authenticate')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              result: {
                authToken: 'employee-access',
                refreshToken: 'employee-refresh',
              },
            }),
            { status: 200 },
          ),
        );
      }
      if (url.includes('/bootstrap')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              data: {
                modules: {
                  cms: [{ moduleName: 'cms', environment: 'startioLocal' }],
                },
                catalogue: {
                  cms: {
                    enabled: true,
                    category: 'content',
                    icon: 'content',
                    requiredPermissions: ['cms.backoffice.view'],
                    compatibility: { status: 'COMPATIBLE' },
                    navigation: [
                      {
                        id: 'cms',
                        label: 'Content',
                        route: '/content',
                        order: 200,
                        requiredPermissions: ['cms.backoffice.view'],
                      },
                    ],
                  },
                },
                availability: {
                  cms: { state: 'UP' },
                },
                axisPolicy: {
                  contractVersion: 1,
                  screenLockEnabled: true,
                  idleTimeoutSeconds: 900,
                  revision: 0,
                  source: 'DEFAULT',
                },
              },
            }),
            { status: 200 },
          ),
        );
      }
      if (url.includes('/token/logout')) {
        return Promise.resolve(
          new Response(JSON.stringify({ result: true }), { status: 200 }),
        );
      }
      const authenticated = new Headers(options?.headers).get('Authorization');
      return Promise.resolve(
        new Response(
          JSON.stringify({
            result: authenticated ? dashboardPage : loginPage,
          }),
          { status: 200 },
        ),
      );
    });
    vi.stubGlobal('fetch', request);
    const user = userEvent.setup();

    render(
      <AppProviders runtimeConfig={runtimeConfig}>
        <App />
      </AppProviders>,
    );

    await user.type(await screen.findByLabelText(/Employee ID/), 'operator');
    await user.type(screen.getByLabelText(/Password/), 'secret');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Authenticated employee workspace')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(
      screen.getByRole('navigation', { name: 'Primary navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Content' })).toBeInTheDocument();
    expect(screen.getByText('Enterprise: enterprise-a')).toBeInTheDocument();
    expect(screen.getByText('startioLocal')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Content' }));
    expect(
      await screen.findByText(
        'This authorized module capability was discovered through BackOffice.',
      ),
    ).toBeVisible();
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(
      request.mock.calls.some(([, options]) =>
        new Headers(options?.headers).get('Authorization')?.includes('employee-access'),
      ),
    ).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Open employee menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(await screen.findByLabelText(/Employee ID/)).toBeVisible();
  });
});
