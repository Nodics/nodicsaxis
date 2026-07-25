import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { describe, expect, it } from 'vitest';

import type { CmsComponentContract } from '../../../../../src/cms/cmsContract';
import { DocumentationArticleRenderer } from '../../../../../src/cms/renderers/components/documentation/DocumentationArticleRenderer';

const article: CmsComponentContract = {
  code: 'docsComponent',
  typeCode: 'documentationArticle',
  renderer: 'documentation.component.article',
  rendererContractVersion: 1,
  rendererChannels: ['web', 'mobile-webview'],
  rendererDeprecated: false,
  properties: {
    title: 'Build your first capability',
    category: 'Getting started',
    audience: ['developer'],
    blocks: [
      {
        kind: 'paragraph',
        text: 'Continue with the [configuration guide](/docs/configuration).',
      },
      { kind: 'unordered-list', items: ['First step', 'Second step'] },
      { kind: 'code', text: 'npm run test:basic' },
      {
        kind: 'paragraph',
        text: '[Unsafe](javascript:alert(document.domain))',
      },
    ],
  },
  slot: 'article',
  index: 10,
  components: [],
};

describe('DocumentationArticleRenderer', () => {
  it('renders bounded declarative documentation and safe internal links', () => {
    render(
      <MemoryRouter>
        <DocumentationArticleRenderer component={article} />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Build your first capability' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'configuration guide' })).toHaveAttribute(
      'href',
      '/docs/configuration',
    );
    expect(screen.getByText('First step')).toBeInTheDocument();
    expect(screen.getByText('npm run test:basic')).toBeInTheDocument();
    expect(screen.getByText(/Unsafe/)).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Unsafe' })).not.toBeInTheDocument();
  });

  it('rejects executable component property shapes without rendering markup', () => {
    const executable = {
      ...article,
      properties: {
        ...article.properties,
        blocks: [{ kind: 'html', text: '<script>window.bad = true</script>' }],
      },
    };
    const { container } = render(
      <MemoryRouter>
        <DocumentationArticleRenderer component={executable} />
      </MemoryRouter>,
    );

    expect(container.querySelector('script')).toBeNull();
    expect(screen.queryByText('window.bad = true')).not.toBeInTheDocument();
  });
});
