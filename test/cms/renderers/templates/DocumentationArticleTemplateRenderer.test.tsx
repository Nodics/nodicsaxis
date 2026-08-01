import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import type { CmsPageContract } from '../../../../src/cms/cmsContract';
import { DocumentationArticleTemplateRenderer } from '../../../../src/cms/renderers/templates/DocumentationArticleTemplateRenderer';

const page: CmsPageContract = {
  code: 'frameworkDocsPage',
  name: 'Framework documentation',
  typeCode: 'documentationArticlePage',
  template: 'documentationArticleTemplate',
  renderer: 'documentation.page.article',
  rendererContractVersion: 1,
  rendererChannels: ['web'],
  rendererDeprecated: false,
  templateContract: {
    code: 'documentationArticleTemplate',
    renderer: 'documentation.template.article',
    contractVersion: 1,
  },
  components: [],
};

describe('DocumentationArticleTemplateRenderer', () => {
  it('keeps documentation navigation on the left and lets readers hide it', async () => {
    const user = userEvent.setup();
    render(
      <DocumentationArticleTemplateRenderer
        page={page}
        slots={{
          navigation: <nav aria-label="Documentation">Documentation navigation</nav>,
          article: <h1>Framework article</h1>,
        }}
      />,
    );

    expect(screen.getByText('Documentation navigation')).toBeVisible();
    expect(
      screen.getByRole('article', { name: 'Framework documentation' }),
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Hide documentation navigation' }),
    );

    expect(screen.queryByText('Documentation navigation')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Show documentation navigation' }),
    ).toBeVisible();

    await user.click(
      screen.getByRole('button', { name: 'Show documentation navigation' }),
    );

    expect(screen.getByText('Documentation navigation')).toBeVisible();
  });
});
