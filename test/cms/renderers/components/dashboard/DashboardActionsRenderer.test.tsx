import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DashboardActionsRenderer } from '../../../../../src/cms/renderers/components/dashboard/DashboardActionsRenderer';
import type { CmsComponentContract } from '../../../../../src/cms/cmsContract';

const actionsComponent: CmsComponentContract = {
  code: 'axisDashboardActionsComponent',
  typeCode: 'axisDashboardActionsComponentType',
  renderer: 'axis.component.dashboard-actions',
  rendererContractVersion: 1,
  rendererChannels: ['web'],
  rendererDeprecated: false,
  properties: {
    title: 'Quick actions',
    actions: [],
    placeholder: true,
  },
  slot: 'quickActions',
  index: 40,
  components: [],
};

describe('DashboardActionsRenderer', () => {
  it('keeps static actions unavailable until modules advertise operations', () => {
    render(<DashboardActionsRenderer component={actionsComponent} />);

    expect(screen.getByText('Quick actions')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Review approvals' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Browse schemas' })).toBeDisabled();
    expect(
      screen.getByText(
        'Actions become available when their authoritative modules advertise them.',
      ),
    ).toBeInTheDocument();
  });
});
