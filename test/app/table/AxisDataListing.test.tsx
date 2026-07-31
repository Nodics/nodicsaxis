import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { AxisDataListing } from '../../../src/app/table/AxisDataListing';

describe('AxisDataListing', () => {
  it('renders a contrasted sortable listing with export control and empty state support', async () => {
    const user = userEvent.setup();
    const onSortOverrideChange = vi.fn();
    const onColumnsChange = vi.fn();
    const allColumns = [
      {
        key: 'code',
        label: 'Code',
        sortKey: 'code',
        render: (record: { readonly code: string; readonly status: string }) =>
          record.code,
        exportValue: (record: { readonly code: string; readonly status: string }) =>
          record.code,
      },
      {
        key: 'status',
        label: 'Status',
        sortKey: 'status',
        render: (record: { readonly code: string; readonly status: string }) =>
          record.status,
        exportValue: (record: { readonly code: string; readonly status: string }) =>
          record.status,
      },
    ];

    render(
      <AxisDataListing
        ariaLabel="Media records"
        availableColumns={allColumns}
        columns={allColumns}
        emptyMessage="No records"
        getRowKey={(record) => record.code}
        records={[{ code: 'media-a', status: 'READY' }]}
        sortableFields={['code', 'status']}
        toolbarStart="1 result"
        onColumnsChange={onColumnsChange}
        onSortOverrideChange={onSortOverrideChange}
      />,
    );

    expect(screen.getByRole('table', { name: 'Media records' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Export' })).toBeEnabled();

    await user.click(screen.getByRole('button', { name: 'Code' }));
    expect(onSortOverrideChange).toHaveBeenCalledWith({
      field: 'code',
      direction: 'ASC',
    });

    await user.click(screen.getByRole('button', { name: 'Columns' }));
    await user.click(screen.getByRole('checkbox', { name: 'Toggle Status column' }));
    expect(onColumnsChange).toHaveBeenCalledWith(['code'], [allColumns[0]]);

    await user.click(screen.getByRole('button', { name: 'Move Status left' }));
    expect(onColumnsChange).toHaveBeenLastCalledWith(
      ['status', 'code'],
      [allColumns[1], allColumns[0]],
    );
  });
});
