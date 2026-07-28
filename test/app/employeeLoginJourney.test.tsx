import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { App } from '../../src/app/App';
import { AppProviders } from '../../src/app/AppProviders';
import { validResolvedPage } from '../cms/fixtures/resolvedPage';

const runtimeConfig = {
  backofficeBaseUrl: 'https://backoffice.example.com',
  enterpriseCode: 'enterprise-a',
  clientContractVersion: 1,
  requestTimeoutMs: 10_000,
  browserSessionCsrfCookieName: 'nodics_axis_csrf',
  assistantMaximumEventBytes: 65_536,
  assistantReconnectWindowMs: 120_000,
  assistantIdleTimeoutMs: 45_000,
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

const assistantPage = {
  ...validResolvedPage,
  path: '/assistant',
  page: {
    ...validResolvedPage.page,
    code: 'axisAssistantPage',
    name: 'Axis Assistant',
    typeCode: 'axisAssistantPageType',
    renderer: 'axis.page.assistant',
    template: 'axisAssistantPageTemplate',
    templateContract: {
      code: 'axisAssistantPageTemplate',
      renderer: 'axis.template.assistant',
      contractVersion: 1,
    },
    components: [
      {
        code: 'axisAssistantWorkspaceComponent',
        typeCode: 'axisAssistantWorkspaceComponentType',
        renderer: 'axis.component.assistant-workspace',
        rendererContractVersion: 1,
        rendererChannels: ['web', 'mobile-webview'],
        rendererDeprecated: false,
        properties: {
          title: 'How can I help?',
          welcomeMessage: 'Ask about authorized operations.',
          inputPlaceholder: 'Describe what you want to do',
          submitLabel: 'Send',
          stopLabel: 'Stop',
          emptyState: 'Assistant activity appears here.',
          employeeLabel: 'You',
          assistantLabel: 'Axis Assistant',
          workingLabel: 'Working',
          cancellingLabel: 'Stopping',
          errorLabel: 'Request failed',
          historyLabel: 'Conversations',
          newConversationLabel: 'New conversation',
          noConversationsLabel: 'No conversations',
          loadMoreLabel: 'Load more',
          clarificationTitle: 'More information required',
          clarificationSubmitLabel: 'Continue',
          toolPlanTitle: 'Proposed governed action',
          confirmationTitle: 'Review and confirm',
          approveLabel: 'Approve action',
          executeLabel: 'Execute approved action',
          confirmationExpiredLabel: 'Confirmation expired',
          confirmationCompletedLabel: 'Action completed',
          toolPlannedLabel: 'Action prepared',
          toolRunningLabel: 'Action in progress',
          toolSucceededLabel: 'Action completed',
          toolFailedLabel: 'Action failed',
          citationsTitle: 'Sources',
          noCitationsLabel: 'No sources supplied',
          usageTitle: 'AI usage',
          inputTokensLabel: 'Input',
          outputTokensLabel: 'Output',
          cachedTokensLabel: 'Cached input',
          reasoningTokensLabel: 'Reasoning',
          embeddingTokensLabel: 'Embedding',
          reconciliationLabel: 'Accounting status',
        },
        slot: 'workspace',
        index: 20,
        components: [],
      },
    ],
  },
};

describe('employee login journey', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
  });

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
      if (url.includes('/employee/browser/authenticate')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              result: {
                authToken: 'employee-access',
                loginId: 'operator',
              },
            }),
            { status: 200 },
          ),
        );
      }
      if (url.includes('/employee/browser/restore')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              result: {
                authToken: 'restored-employee-access',
                loginId: 'operator',
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
                  aiAssistant: [
                    {
                      moduleName: 'aiAssistant',
                      instanceId: 'runtime-1',
                      environment: 'startioLocal',
                      clientCallable: true,
                      endpoint: 'https://assistant.example.com/nodics/aiAssistant',
                      state: 'UP',
                    },
                  ],
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
                  aiAssistant: {
                    enabled: true,
                    category: 'platform',
                    icon: 'assistant',
                    requiredPermissions: ['ai.assistant.use'],
                    compatibility: { status: 'COMPATIBLE' },
                    navigation: [
                      {
                        id: 'assistant',
                        label: 'Axis Assistant',
                        route: '/assistant',
                        order: 50,
                        requiredPermissions: ['ai.assistant.use'],
                      },
                    ],
                  },
                },
                availability: {
                  cms: { state: 'UP' },
                  aiAssistant: { state: 'UP' },
                },
                axisPolicy: {
                  contractVersion: 1,
                  screenLockEnabled: true,
                  idleTimeoutSeconds: 900,
                  revision: 0,
                  source: 'DEFAULT',
                },
                documentationSources: [],
                tenantCode: 'default',
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
      const deliveredPage = url.includes('path=%2Fassistant')
        ? assistantPage
        : authenticated
          ? dashboardPage
          : loginPage;
      return Promise.resolve(
        new Response(
          JSON.stringify({
            result: deliveredPage,
          }),
          { status: 200 },
        ),
      );
    });
    vi.stubGlobal('fetch', request);
    const user = userEvent.setup();

    const rendered = render(
      <AppProviders runtimeConfig={runtimeConfig}>
        <App />
      </AppProviders>,
    );

    await user.type(await screen.findByLabelText(/Employee ID/), 'operator');
    await user.type(screen.getByLabelText(/Password/), 'secret');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Authenticated employee workspace')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Axis Assistant' }));
    expect(
      await screen.findByRole('heading', { name: 'How can I help?' }),
    ).toBeVisible();
    expect(
      screen.getByRole('button', {
        name: [
          'Current context: Environment: Startio Local',
          'Tenant: Default',
          'Enterprise: Enterprise A',
          'Site: Axis CMS Site',
          'Catalog: Axis Content Catalog',
        ].join(', '),
      }),
    ).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    expect(
      screen.getByRole('navigation', { name: 'Primary navigation' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Content' })).toBeInTheDocument();
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

    document.cookie = 'nodics_axis_csrf=refresh-csrf; Path=/';
    rendered.unmount();
    render(
      <AppProviders runtimeConfig={runtimeConfig}>
        <App />
      </AppProviders>,
    );
    expect(
      await screen.findByText(
        'This authorized module capability was discovered through BackOffice.',
      ),
    ).toBeVisible();
    expect(
      request.mock.calls.some(([, options]) =>
        new Headers(options?.headers)
          .get('Authorization')
          ?.includes('restored-employee-access'),
      ),
    ).toBe(true);

    await user.click(screen.getByRole('button', { name: 'Open employee menu' }));
    await user.click(screen.getByRole('menuitem', { name: 'Sign out' }));
    expect(await screen.findByLabelText(/Employee ID/)).toBeVisible();
  });

  it('restores the lock screen after a browser refresh until password verification', async () => {
    window.history.pushState({}, '', '/dashboard');
    window.sessionStorage.setItem(
      'nodics-axis-screen-lock-v1',
      JSON.stringify({ locked: true, returnPath: '/dashboard' }),
    );
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
      if (url.includes('/employee/browser/restore')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              result: {
                authToken: 'restored-employee-access',
                loginId: 'operator',
              },
            }),
            { status: 200 },
          ),
        );
      }
      if (url.includes('/employee/browser/authenticate')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({
              result: {
                authToken: 'unlocked-employee-access',
                loginId: 'operator',
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
                modules: {},
                catalogue: {},
                availability: {},
                axisPolicy: {
                  contractVersion: 1,
                  screenLockEnabled: true,
                  idleTimeoutSeconds: 900,
                  revision: 0,
                  source: 'DEFAULT',
                },
                documentationSources: [],
                tenantCode: 'default',
              },
            }),
            { status: 200 },
          ),
        );
      }
      const path = new URL(url).searchParams.get('path');
      const deliveredPage =
        path === '/lock-screen'
          ? {
              ...loginPage,
              path: '/lock-screen',
              page: {
                ...loginPage.page,
                components: [
                  {
                    code: 'axisEmployeeLockFormComponent',
                    typeCode: 'axisEmployeeLockFormComponentType',
                    renderer: 'axis.component.employee-lock-form',
                    rendererContractVersion: 1,
                    rendererChannels: ['web'],
                    rendererDeprecated: false,
                    properties: {
                      passwordLabel: 'Password',
                      submitLabel: 'Unlock',
                    },
                    slot: 'authentication',
                    index: 30,
                    components: [],
                  },
                ],
              },
            }
          : dashboardPage;
      expect(new Headers(options?.headers).get('Authorization')).toBeTruthy();
      return Promise.resolve(
        new Response(JSON.stringify({ result: deliveredPage }), { status: 200 }),
      );
    });
    vi.stubGlobal('fetch', request);
    const user = userEvent.setup();

    render(
      <AppProviders runtimeConfig={runtimeConfig}>
        <App />
      </AppProviders>,
    );

    expect(await screen.findByRole('button', { name: 'Unlock' })).toBeVisible();
    expect(
      screen.queryByText('Authenticated employee workspace'),
    ).not.toBeInTheDocument();

    await user.type(screen.getByLabelText(/Password/), 'secret');
    await user.click(screen.getByRole('button', { name: 'Unlock' }));

    expect(await screen.findByText('Authenticated employee workspace')).toBeVisible();
    expect(window.sessionStorage.getItem('nodics-axis-screen-lock-v1')).toBeNull();
  });
});
