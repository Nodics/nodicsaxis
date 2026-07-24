import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router';
import { describe, expect, it, vi } from 'vitest';

import { CmsPageRenderer } from '../../src/cms/CmsPageRenderer';
import { parseCmsResolvedPage } from '../../src/cms/cmsContract';
import { validResolvedPage } from './fixtures/resolvedPage';

describe('CmsPageRenderer', () => {
  it('renders a supported CMS page with Axis-owned components', async () => {
    render(
      <BrowserRouter>
        <CmsPageRenderer contract={parseCmsResolvedPage(validResolvedPage)} />
      </BrowserRouter>,
    );

    expect((await screen.findAllByLabelText('Nodics Axis')).length).toBeGreaterThan(0);
    expect(
      screen.getByText('One governed workspace for every business capability.'),
    ).toBeVisible();
    expect(screen.getByText('Welcome back')).toBeVisible();
  });

  it('isolates an unsupported renderer behind a safe fallback', async () => {
    const unsupported = {
      ...validResolvedPage,
      page: {
        ...validResolvedPage.page,
        renderer: 'https://malicious.example/renderer.js',
      },
    };
    render(
      <BrowserRouter>
        <CmsPageRenderer contract={parseCmsResolvedPage(unsupported)} />
      </BrowserRouter>,
    );

    expect(
      await screen.findByText('This page component could not be displayed safely.'),
    ).toBeVisible();
    expect(screen.queryByText('malicious.example')).not.toBeInTheDocument();
  });

  it('renders the secured employee lock form and delegates re-verification', async () => {
    const unlock = vi.fn();
    const signOut = vi.fn();
    const user = userEvent.setup();
    const lockPage = {
      ...validResolvedPage,
      path: '/lock-screen',
      page: {
        ...validResolvedPage.page,
        code: 'axisLockScreenPage',
        components: [
          ...validResolvedPage.page.components,
          {
            code: 'axisEmployeeLockFormComponent',
            typeCode: 'axisEmployeeLockFormComponentType',
            renderer: 'axis.component.employee-lock-form',
            rendererContractVersion: 1,
            rendererChannels: ['web', 'mobile-webview'],
            rendererDeprecated: false,
            properties: {
              title: 'Unlock Axis',
              employeeLabel: 'Signed in as',
              passwordLabel: 'Password',
              passwordPlaceholder: 'Enter your password',
              submitLabel: 'Unlock',
              signOutLabel: 'Not you? Sign out',
            },
            slot: 'authentication',
            index: 30,
            components: [],
          },
        ],
      },
    };

    render(
      <BrowserRouter>
        <CmsPageRenderer
          actions={{
            currentEmployeeId: 'axis.operator',
            onEmployeeSignOut: signOut,
            onEmployeeUnlock: unlock,
          }}
          contract={parseCmsResolvedPage(lockPage)}
        />
      </BrowserRouter>,
    );

    expect(await screen.findByText('axis.operator')).toBeVisible();
    await user.type(screen.getByPlaceholderText('Enter your password'), 'secret');
    await user.click(screen.getByRole('button', { name: 'Unlock' }));
    expect(unlock).toHaveBeenCalledWith('secret');
    await user.click(screen.getByRole('button', { name: 'Not you? Sign out' }));
    expect(signOut).toHaveBeenCalledTimes(1);
  });
});
