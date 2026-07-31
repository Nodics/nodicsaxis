import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import type { WorkbenchSchema } from '../../../src/workbench/api/workbenchContracts';
import { WorkbenchRecordDetail } from '../../../src/workbench/detail/WorkbenchRecordDetail';

const schema: WorkbenchSchema = {
  moduleName: 'profile',
  schemaName: 'address',
  label: 'Address',
  description: '',
  displayProperty: 'code',
  displayProperties: ['code'],
  queryCapabilities: {
    searchableFields: ['code'],
    sortableFields: ['code'],
    filterFields: [],
    groupOperators: ['AND', 'OR'],
    textOperator: 'CONTAINS',
    allowedPageSizes: [10, 25, 50],
    defaultPageSize: 25,
    maximumPageSize: 50,
    defaultSort: { field: 'code', direction: 'ASC' },
  },
  mutationMode: 'GENERATED_CRUD',
  operations: ['search', 'read'],
  fields: [
    {
      name: 'code',
      label: 'Code',
      type: 'string',
      required: true,
      readOnly: false,
      primary: true,
      description: '',
      searchable: true,
    },
  ],
  relationships: [],
};

describe('WorkbenchRecordDetail', () => {
  it('does not expose mutation actions absent from the backend descriptor', () => {
    render(
      <WorkbenchRecordDetail
        closeLabel="Close"
        deleteLabel="Delete"
        editLabel="Edit"
        falseLabel="No"
        record={{ code: 'DXB-OFFICE' }}
        schema={schema}
        trueLabel="Yes"
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Delete' })).not.toBeInTheDocument();
  });

  it('renders dates and booleans as user-friendly localized values', () => {
    const formattedSchema: WorkbenchSchema = {
      ...schema,
      fields: [
        ...schema.fields,
        {
          name: 'enabled',
          label: 'Enabled',
          type: 'boolean',
          required: false,
          readOnly: false,
          primary: false,
          description: '',
          searchable: false,
        },
        {
          name: 'created',
          label: 'Created',
          type: 'date',
          required: false,
          readOnly: true,
          primary: false,
          description: '',
          searchable: false,
        },
      ],
    };
    render(
      <WorkbenchRecordDetail
        closeLabel="Close"
        deleteLabel="Delete"
        editLabel="Edit"
        falseLabel="No"
        record={{
          code: 'DXB-OFFICE',
          enabled: true,
          created: '2026-07-25T10:00:00.000Z',
        }}
        schema={formattedSchema}
        trueLabel="Yes"
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('Yes')).toBeVisible();
    expect(screen.getByText(/2026/)).toBeVisible();
    expect(screen.queryByText('2026-07-25T10:00:00.000Z')).not.toBeInTheDocument();
  });

  it('renders inline nested fields without showing the parent object as related data', () => {
    const employeeSchema: WorkbenchSchema = {
      ...schema,
      label: 'Employee',
      displayProperty: 'loginId',
      displayProperties: ['loginId', 'name.firstName', 'name.lastName'],
      fields: [
        {
          name: 'loginId',
          label: 'Login',
          type: 'string',
          required: true,
          readOnly: false,
          primary: true,
          description: '',
          searchable: true,
        },
        {
          name: 'name',
          label: 'Name',
          type: 'object',
          required: true,
          readOnly: false,
          primary: false,
          description: '',
          searchable: false,
        },
        {
          name: 'name.firstName',
          label: 'First name',
          type: 'string',
          required: true,
          readOnly: false,
          primary: false,
          description: '',
          searchable: true,
        },
        {
          name: 'name.lastName',
          label: 'Last name',
          type: 'string',
          required: true,
          readOnly: false,
          primary: false,
          description: '',
          searchable: true,
        },
      ],
    };
    render(
      <WorkbenchRecordDetail
        closeLabel="Close"
        deleteLabel="Delete"
        editLabel="Edit"
        falseLabel="No"
        record={{
          loginId: 'admin',
          name: { firstName: 'Admin', lastName: 'User' },
        }}
        schema={employeeSchema}
        trueLabel="Yes"
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    expect(screen.getByText('Admin')).toBeVisible();
    expect(screen.getByText('User')).toBeVisible();
    expect(screen.queryByText('Related data')).not.toBeInTheDocument();
  });
});
