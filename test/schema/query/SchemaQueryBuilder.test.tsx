import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { SchemaQueryBuilder } from '../../../src/schema/query/SchemaQueryBuilder';
import type {
  WorkbenchFilterGroup,
  WorkbenchQueryCapabilities,
  WorkbenchRecordQuery,
} from '../../../src/workbench/api/workbenchContracts';

const copy = {
  addConditionLabel: 'Add condition',
  addGroupLabel: 'Add group',
  applyFiltersLabel: 'Apply filters',
  ascendingLabel: 'Ascending',
  clearFiltersLabel: 'Clear filters',
  descendingLabel: 'Descending',
  fieldLabel: 'Field',
  filterBuilderLabel: 'Advanced filters',
  matchLabel: 'Match',
  noFiltersSummaryLabel: 'No advanced filters',
  operatorLabel: 'Operator',
  removeLabel: 'Remove',
  requestPreviewLabel: 'Backend request preview',
  sortBuilderLabel: 'Sort results',
  sortDirectionLabel: 'Direction',
  sortFieldLabel: 'Sort field',
  valueLabel: 'Value',
};

const capabilities: WorkbenchQueryCapabilities = {
  searchableFields: ['code', 'city', 'active'],
  sortableFields: ['code', 'city'],
  filterFields: [
    {
      field: 'city',
      label: 'City',
      type: 'string',
      operators: ['EQUALS', 'CONTAINS'],
    },
    {
      field: 'active',
      label: 'Active',
      type: 'boolean',
      operators: ['EQUALS'],
    },
  ],
  groupOperators: ['AND', 'OR'],
  textOperator: 'CONTAINS',
  allowedPageSizes: [10, 25, 50],
  defaultPageSize: 25,
  maximumPageSize: 50,
  defaultSort: { field: 'code', direction: 'ASC' },
};

describe('SchemaQueryBuilder', () => {
  it('emits only backend-advertised filter conditions', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn<(value?: WorkbenchFilterGroup) => void>();

    render(
      <SchemaQueryBuilder
        capabilities={capabilities}
        copy={copy}
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    await user.clear(screen.getByRole('textbox', { name: 'Value' }));
    await user.type(screen.getByRole('textbox', { name: 'Value' }), 'Dubai');
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));

    expect(onChange).toHaveBeenCalledWith({
      operator: 'AND',
      items: [{ field: 'city', operator: 'EQUALS', value: 'Dubai' }],
    });
  });

  it('uses backend-advertised sortable fields and ignores unsupported incoming sort', async () => {
    const user = userEvent.setup();
    const onSortChange = vi.fn<(sort: WorkbenchRecordQuery['sort']) => void>();

    render(
      <SchemaQueryBuilder
        capabilities={capabilities}
        copy={copy}
        sort={{ field: 'databasePassword', direction: 'DESC' }}
        onChange={vi.fn<(value?: WorkbenchFilterGroup) => void>()}
        onSortChange={onSortChange}
      />,
    );

    expect(screen.getByRole('combobox', { name: 'Sort field' })).toHaveTextContent(
      'Code',
    );

    await user.click(screen.getByRole('combobox', { name: 'Sort field' }));
    expect(screen.getByRole('option', { name: 'Code' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'City' })).toBeVisible();
    expect(screen.queryByRole('option', { name: /database password/iu })).toBeNull();

    await user.click(screen.getByRole('option', { name: 'City' }));
    expect(onSortChange).toHaveBeenCalledWith({ field: 'city', direction: 'ASC' });
  });

  it('keeps operators scoped to the selected backend field', async () => {
    const user = userEvent.setup();

    render(
      <SchemaQueryBuilder
        capabilities={capabilities}
        copy={copy}
        onChange={vi.fn<(value?: WorkbenchFilterGroup) => void>()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    await user.click(screen.getByRole('combobox', { name: 'Operator' }));

    expect(screen.getByRole('option', { name: 'Equals' })).toBeVisible();
    expect(screen.getByRole('option', { name: 'Contains' })).toBeVisible();
    expect(screen.queryByRole('option', { name: 'Greater than' })).toBeNull();
  });

  it('renders nothing when the backend advertises no filter or sort capabilities', () => {
    const noQueryCapabilities: WorkbenchQueryCapabilities = {
      ...capabilities,
      sortableFields: [],
      filterFields: [],
      defaultSort: { field: 'code', direction: 'ASC' },
    };

    const { container } = render(
      <SchemaQueryBuilder
        capabilities={noQueryCapabilities}
        copy={copy}
        onChange={vi.fn<(value?: WorkbenchFilterGroup) => void>()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });
});
