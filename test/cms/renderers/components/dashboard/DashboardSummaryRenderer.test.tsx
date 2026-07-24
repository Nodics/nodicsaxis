import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DashboardSummaryRenderer } from '../../../../../src/cms/renderers/components/dashboard/DashboardSummaryRenderer';
import type { CmsComponentContract } from '../../../../../src/cms/cmsContract';

const summaryComponent: CmsComponentContract = {
  code: 'axisDashboardSummaryComponent',
  typeCode: 'axisDashboardSummaryComponentType',
  renderer: 'axis.component.dashboard-summary',
  rendererContractVersion: 1,
  rendererChannels: ['web'],
  rendererDeprecated: false,
  properties: {
    title: 'Business summary',
    items: [],
    placeholder: true,
  },
  slot: 'summary',
  index: 30,
  components: [],
};

describe('DashboardSummaryRenderer', () => {
  it('labels placeholder metrics without fabricating operational values', () => {
    render(<DashboardSummaryRenderer component={summaryComponent} />);

    expect(screen.getByText('Business summary')).toBeInTheDocument();
    expect(screen.getAllByText('—')).toHaveLength(4);
    expect(screen.getByText('Waiting for Workflow')).toBeInTheDocument();
    expect(screen.getByText('Waiting for monitoring')).toBeInTheDocument();
  });
});
