import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { AxisSchemaDataListing } from '../../../src/app/table/AxisSchemaDataListing';
import type { WorkbenchSchema } from '../../../src/workbench/api/workbenchContracts';

const employeeSchema: WorkbenchSchema = {
  moduleName: 'profile',
  schemaName: 'employee',
  label: 'Employee',
  description: '',
  displayProperty: 'loginId',
  displayProperties: ['loginId', 'name.firstName', 'name.lastName'],
  queryCapabilities: {
    searchableFields: ['loginId', 'name.firstName', 'name.lastName'],
    sortableFields: ['loginId', 'name.firstName', 'name.lastName'],
    filterFields: [],
    groupOperators: ['AND', 'OR'],
    textOperator: 'CONTAINS',
    allowedPageSizes: [10, 25, 50],
    defaultPageSize: 25,
    maximumPageSize: 50,
    defaultSort: { field: 'loginId', direction: 'ASC' },
  },
  mutationMode: 'GENERATED_CRUD',
  operations: ['search', 'read'],
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
      name: 'name.firstName',
      label: 'First name',
      type: 'string',
      required: false,
      readOnly: false,
      primary: false,
      description: '',
      searchable: true,
    },
    {
      name: 'name.lastName',
      label: 'Last name',
      type: 'string',
      required: false,
      readOnly: false,
      primary: false,
      description: '',
      searchable: true,
    },
  ],
  relationships: [],
};

describe('AxisSchemaDataListing', () => {
  it('renders nested record values for dotted schema fields', () => {
    render(
      <AxisSchemaDataListing
        ariaLabel="Employee records"
        defaultVisibleColumnKeys={['loginId', 'name.firstName', 'name.lastName']}
        emptyMessage="No records"
        getRowKey={(record) => String(record.loginId)}
        records={[
          {
            loginId: 'admin',
            name: { firstName: 'Admin', lastName: 'User' },
          },
        ]}
        schema={employeeSchema}
      />,
    );

    expect(screen.getByRole('cell', { name: 'admin' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Admin' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'User' })).toBeVisible();
  });
});
