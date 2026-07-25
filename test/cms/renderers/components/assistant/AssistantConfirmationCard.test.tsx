import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AssistantConfirmationCard } from '../../../../../src/cms/renderers/components/assistant/AssistantConfirmationCard';

const confirmation = {
  confirmationCode: 'confirmation-1',
  conversationCode: 'conversation-1',
  operationId: 'profile_createenterprise',
  state: 'PENDING',
  argumentsDigest: 'digest-1',
  revision: 0,
  expiresAt: '2099-01-01T00:00:00.000Z',
  impact: { summary: 'Create enterprise acme' },
};

describe('AssistantConfirmationCard', () => {
  it('uses CMS labels and requires separate approval and execution actions', async () => {
    const user = userEvent.setup();
    const approve = vi.fn();
    const execute = vi.fn();
    const labels = {
      title: 'Review and confirm',
      approveLabel: 'Approve action',
      executeLabel: 'Execute approved action',
      rejectLabel: 'Reject action',
      expiredLabel: 'Confirmation expired',
      completedLabel: 'Action completed',
    };
    const { rerender } = render(
      <AssistantConfirmationCard
        {...labels}
        confirmation={confirmation}
        onApprove={approve}
        onExecute={execute}
        onReject={vi.fn()}
      />,
    );

    expect(screen.getByText('Create enterprise acme')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Approve action' }));
    expect(approve).toHaveBeenCalledOnce();
    expect(execute).not.toHaveBeenCalled();

    rerender(
      <AssistantConfirmationCard
        {...labels}
        confirmation={{ ...confirmation, state: 'APPROVED', revision: 1 }}
        onApprove={approve}
        onExecute={execute}
        onReject={vi.fn()}
      />,
    );
    await user.click(screen.getByRole('button', { name: 'Execute approved action' }));
    expect(execute).toHaveBeenCalledOnce();
  });

  it('does not expose an action for an expired confirmation', () => {
    render(
      <AssistantConfirmationCard
        approveLabel="Approve action"
        completedLabel="Action completed"
        confirmation={{ ...confirmation, state: 'EXPIRED' }}
        executeLabel="Execute approved action"
        rejectLabel="Reject action"
        expiredLabel="Confirmation expired"
        title="Review and confirm"
        onApprove={vi.fn()}
        onExecute={vi.fn()}
        onReject={vi.fn()}
      />,
    );

    expect(screen.getByText('Confirmation expired')).toBeVisible();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
