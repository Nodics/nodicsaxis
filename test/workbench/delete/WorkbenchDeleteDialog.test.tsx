import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { WorkbenchDeleteDialog } from '../../../src/workbench/delete/WorkbenchDeleteDialog';

describe('WorkbenchDeleteDialog', () => {
  it('shows governed context and requires explicit confirmation', async () => {
    const user = userEvent.setup();
    const confirm = vi.fn().mockResolvedValue(undefined);
    render(
      <WorkbenchDeleteDialog
        cancelLabel="Cancel"
        confirmLabel="Delete record"
        deleting={false}
        deletingLabel="Deleting"
        enterpriseCode="electronics"
        enterpriseLabel="Enterprise"
        identity="DXB-OFFICE"
        open
        schemaLabel="Address"
        tenantCode="default"
        tenantLabel="Tenant"
        title="Delete this record?"
        warning="This action cannot be undone."
        onCancel={vi.fn()}
        onConfirm={confirm}
      />,
    );

    expect(screen.getByText('Address: DXB-OFFICE')).toBeVisible();
    expect(screen.getByText('Tenant: default')).toBeVisible();
    expect(screen.getByText('Enterprise: electronics')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Delete record' }));
    expect(confirm).toHaveBeenCalledTimes(1);
  });

  it('prevents duplicate confirmation while deletion is pending', () => {
    render(
      <WorkbenchDeleteDialog
        cancelLabel="Cancel"
        confirmLabel="Delete record"
        deleting
        deletingLabel="Deleting"
        enterpriseCode="default"
        enterpriseLabel="Enterprise"
        error="The record is still referenced."
        identity="DXB-OFFICE"
        open
        schemaLabel="Address"
        tenantCode="default"
        tenantLabel="Tenant"
        title="Delete this record?"
        warning="This action cannot be undone."
        onCancel={vi.fn()}
        onConfirm={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Deleting' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
    expect(screen.getByText('The record is still referenced.')).toBeVisible();
  });
});
