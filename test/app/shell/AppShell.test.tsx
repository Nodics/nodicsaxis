import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Link, MemoryRouter } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '../../../src/app/shell/AppShell';
import { AxisThemeProvider } from '../../../src/app/AxisThemeProvider';

let scrollTo = vi.fn();

beforeEach(() => {
  scrollTo = vi.fn();
  vi.stubGlobal('scrollTo', scrollTo);
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Axis application shell navigation', () => {
  it('starts each newly selected page at the top without overriding anchor navigation', async () => {
    const user = userEvent.setup();
    render(
      <AxisThemeProvider>
        <MemoryRouter initialEntries={['/docs/first']}>
          <AppShell>
            <Link to="/docs/second">Open second page</Link>
          </AppShell>
        </MemoryRouter>
      </AxisThemeProvider>,
    );
    await user.click(screen.getByRole('link', { name: 'Open second page' }));

    expect(scrollTo).toHaveBeenCalledWith({
      behavior: 'auto',
      left: 0,
      top: 0,
    });
  });

  it('presents tenant and application context with readable names', () => {
    render(
      <AxisThemeProvider>
        <MemoryRouter>
          <AppShell
            catalog="axisContentCatalog"
            enterpriseCode="default"
            environments={['startioLocal']}
            site="axisCmsSite"
            tenantCode="default"
          >
            <div>Workspace</div>
          </AppShell>
        </MemoryRouter>
      </AxisThemeProvider>,
    );

    expect(screen.getByText('Environment: Startio Local')).toBeVisible();
    expect(screen.getByText('Tenant: Default')).toBeVisible();
    expect(screen.getByText('Enterprise: Default')).toBeVisible();
    expect(screen.getByText('Site: Axis CMS Site')).toBeVisible();
    expect(screen.getByText('Catalog: Axis Content Catalog')).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Create' })).not.toBeInTheDocument();
  });

  it('collapses the desktop sidebar to an accessible icon rail', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({
        matches: query.includes('min-width:900px'),
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    );
    const user = userEvent.setup();

    render(
      <AxisThemeProvider>
        <MemoryRouter>
          <AppShell
            navigation={[
              {
                id: 'cms',
                label: 'Content',
                route: '/content',
                order: 200,
                moduleName: 'cms',
                category: 'content',
                icon: 'cms',
                availability: 'UP',
              },
            ]}
          >
            <div>Workspace</div>
          </AppShell>
        </MemoryRouter>
      </AxisThemeProvider>,
    );

    expect(screen.getByText('NODICS')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Collapse navigation' }));

    expect(screen.getByRole('button', { name: 'Expand navigation' })).toBeVisible();
    expect(screen.queryByText('NODICS')).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Content' })).toBeVisible();
    expect(screen.queryByText('Content and Experience')).not.toBeInTheDocument();
  });

  it('uses the authorized BackOffice contribution for the Assistant shortcut', async () => {
    const user = userEvent.setup();

    render(
      <AxisThemeProvider>
        <MemoryRouter>
          <AppShell
            navigation={[
              {
                id: 'assistant',
                label: 'Ask Axis',
                route: '/assistant',
                order: 50,
                moduleName: 'aiAssistant',
                category: 'platform',
                icon: 'assistant',
                availability: 'UP',
              },
            ]}
          >
            <div>Workspace</div>
          </AppShell>
        </MemoryRouter>
      </AxisThemeProvider>,
    );

    const shortcut = screen.getByRole('button', { name: 'Ask Axis' });
    expect(shortcut).toBeEnabled();
    expect(shortcut.querySelector('svg')).toHaveClass('MuiSvgIcon-colorPrimary');
    expect(shortcut.querySelectorAll('svg path')[1]).toHaveAttribute('fill', '#1b1e20');
    await user.click(shortcut);
    expect(screen.getAllByRole('button', { name: 'Ask Axis' })).not.toHaveLength(0);
  });

  it('disables the Assistant shortcut when BackOffice reports it unavailable', () => {
    render(
      <AxisThemeProvider>
        <MemoryRouter>
          <AppShell
            navigation={[
              {
                id: 'assistant',
                label: 'Axis Assistant',
                route: '/assistant',
                order: 50,
                moduleName: 'aiAssistant',
                category: 'platform',
                icon: 'assistant',
                availability: 'UNAVAILABLE',
              },
            ]}
          >
            <div>Workspace</div>
          </AppShell>
        </MemoryRouter>
      </AxisThemeProvider>,
    );

    const shortcut = screen.getByRole('button', { name: 'Axis Assistant' });
    expect(shortcut).toBeDisabled();
    expect(shortcut.querySelector('svg')).toHaveClass('MuiSvgIcon-colorDisabled');
  });

  it('searches matching left-panel navigation and preserves inactive features', async () => {
    const user = userEvent.setup();
    render(
      <AxisThemeProvider>
        <MemoryRouter>
          <AppShell
            navigation={[
              {
                id: 'cms',
                label: 'Content',
                route: '/content',
                order: 10,
                moduleName: 'cms',
                category: 'content',
                icon: 'cms',
                availability: 'UP',
                perspectives: ['content'],
              },
              {
                id: 'pricing',
                label: 'Pricing',
                route: '/pricing',
                order: 20,
                moduleName: 'pricing',
                category: 'commerce',
                icon: 'pricing',
                availability: 'UP',
                perspectives: ['commerce'],
                featureState: 'DISABLED',
              },
            ]}
          >
            <div>Workspace</div>
          </AppShell>
        </MemoryRouter>
      </AxisThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const menuSearch = screen.getByRole('textbox', { name: 'Search menu' });
    await user.type(menuSearch, 'content');
    expect(screen.getByRole('button', { name: 'Content' })).toBeVisible();
    expect(screen.queryByRole('button', { name: 'Pricing' })).not.toBeInTheDocument();

    await user.clear(menuSearch);
    await user.type(menuSearch, 'commerce');
    expect(screen.getByRole('button', { name: 'Pricing' })).toHaveAttribute(
      'aria-disabled',
      'true',
    );

    await user.clear(menuSearch);
    await user.type(menuSearch, 'not available');
    expect(screen.getByText('No matching menu items')).toBeVisible();
  });

  it('expands and collapses navigation groups while exposing search matches', async () => {
    const user = userEvent.setup();
    render(
      <AxisThemeProvider>
        <MemoryRouter>
          <AppShell
            navigation={[
              {
                id: 'cms',
                label: 'Content',
                route: '/content',
                order: 10,
                moduleName: 'cms',
                category: 'content',
                icon: 'cms',
                availability: 'UP',
              },
            ]}
          >
            <div>Workspace</div>
          </AppShell>
        </MemoryRouter>
      </AxisThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    const collapse = screen.getByRole('button', {
      name: 'Collapse Content and Experience',
    });
    expect(collapse).toHaveAttribute('aria-expanded', 'true');

    await user.click(collapse);
    expect(
      screen.getByRole('button', { name: 'Expand Content and Experience' }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('button', { name: 'Content' })).not.toBeInTheDocument();

    await user.type(screen.getByRole('textbox', { name: 'Search menu' }), 'content');
    expect(screen.getByRole('button', { name: 'Content' })).toBeVisible();
    expect(
      screen.getByRole('button', { name: 'Collapse Content and Experience' }),
    ).toHaveAttribute('aria-expanded', 'true');
  });

  it('provides bounded local favourites and recent destinations', async () => {
    const user = userEvent.setup();
    render(
      <AxisThemeProvider>
        <MemoryRouter>
          <AppShell
            navigation={[
              {
                id: 'cms',
                label: 'Content',
                route: '/content',
                order: 10,
                moduleName: 'cms',
                category: 'content',
                icon: 'cms',
                availability: 'UP',
              },
            ]}
          >
            <div>Workspace</div>
          </AppShell>
        </MemoryRouter>
      </AxisThemeProvider>,
    );

    await user.click(screen.getByRole('button', { name: 'Open navigation' }));
    await user.click(screen.getByRole('button', { name: 'Add Content to favourites' }));
    expect(screen.getByText('Favourite: Content')).toBeVisible();
    expect(
      window.localStorage.getItem('nodics-axis-navigation-preferences-v1'),
    ).toContain('cms:cms');
  });
});
