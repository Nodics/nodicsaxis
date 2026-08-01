import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import {
  WorkspaceHeading,
  WorkspaceHelpActions,
  documentationHref,
} from '../../../src/app/help/WorkspaceHelp';

describe('Workspace help affordances', () => {
  it('builds bounded documentation links with optional fragments', () => {
    expect(
      documentationHref({
        documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model',
        documentationFragment: 'websites',
      }),
    ).toBe('/docs/capabilities/content-publishing/wcms-authoring-model#websites');
    expect(documentationHref(undefined)).toBeUndefined();
  });

  it('renders reusable info and documentation actions', () => {
    render(
      <WorkspaceHelpActions
        help={{
          summary: 'Manage CMS websites.',
          documentationRoute: '/docs/capabilities/content-publishing/wcms-authoring-model',
        }}
        label="Websites"
      />,
    );

    expect(screen.getByRole('button', { name: 'Websites help' })).toBeVisible();
    expect(
      screen.getByRole('link', { name: 'Open Websites documentation' }),
    ).toHaveAttribute(
      'href',
      '/docs/capabilities/content-publishing/wcms-authoring-model',
    );
  });

  it('renders a complete workspace heading when pages want the standard block', () => {
    render(
      <WorkspaceHeading
        description="Governed media operations."
        eyebrow="Media"
        help={{ summary: 'Upload and inspect media.' }}
        id="media-title"
        title="Media Management"
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Media Management' }),
    ).toHaveAttribute('id', 'media-title');
    expect(screen.getByText('Governed media operations.')).toBeVisible();
    expect(screen.getByRole('button', { name: 'Media Management help' })).toBeVisible();
  });
});
