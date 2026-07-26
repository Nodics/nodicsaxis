import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import type { CmsComponentContract } from '../../../../../src/cms/cmsContract';
import { DocumentationNavigationRenderer } from '../../../../../src/cms/renderers/components/documentation/DocumentationNavigationRenderer';

const navigation: CmsComponentContract = {
  code: 'nodicsDocumentationNavigation',
  typeCode: 'nodicsDocumentationNavigationComponentType',
  renderer: 'documentation.component.navigation',
  rendererContractVersion: 1,
  rendererChannels: ['web', 'mobile-webview'],
  rendererDeprecated: false,
  properties: {
    title: 'Documentation',
    searchLabel: 'Search documentation',
    searchPlaceholder: 'Search pages, categories, and audiences',
    emptyMessage: 'No documentation matches your search.',
    items: [
      {
        title: 'What Nodics Is',
        route: '/docs/overview/what-is-nodics',
        category: 'overview',
        audience: ['business', 'developer'],
      },
      {
        title: 'Configure Security',
        route: '/docs/security/configure-security',
        category: 'security',
        audience: ['operator'],
      },
      {
        title: 'Unsafe route',
        route: 'javascript:alert(1)',
        category: 'security',
        audience: ['operator'],
      },
    ],
  },
  slot: 'navigation',
  index: 5,
  components: [],
};

describe('DocumentationNavigationRenderer', () => {
  it('searches bounded CMS navigation metadata and rejects unsafe routes', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={['/docs/overview/what-is-nodics']}>
        <DocumentationNavigationRenderer component={navigation} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'What Nodics Is' })).toHaveAttribute(
      'href',
      '/docs/overview/what-is-nodics',
    );
    expect(screen.queryByText('Unsafe route')).not.toBeInTheDocument();

    await user.type(screen.getByLabelText('Search documentation'), 'security');

    expect(screen.getByRole('link', { name: 'Configure Security' })).toBeVisible();
    expect(
      screen.queryByRole('link', { name: 'What Nodics Is' }),
    ).not.toBeInTheDocument();
  });

  it('shows a CMS-owned empty state when no article matches', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DocumentationNavigationRenderer component={navigation} />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText('Search documentation'), 'no-match');
    expect(
      screen.getByText('No documentation matches your search.'),
    ).toBeInTheDocument();
  });
});
