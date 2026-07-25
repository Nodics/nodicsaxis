import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { AppShell } from '../../../src/app/shell/AppShell';
import { AxisThemeProvider } from '../../../src/app/AxisThemeProvider';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('Axis application shell navigation', () => {
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
    expect(screen.getByText('Content and Experience')).not.toBeVisible();
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

    expect(screen.getByRole('button', { name: 'Axis Assistant' })).toBeDisabled();
  });
});
