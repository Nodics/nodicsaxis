import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

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

  it('renders backend relationship columns as reference links without selecting the row', async () => {
    const user = userEvent.setup();
    const onReferenceClick = vi.fn();
    const onRowClick = vi.fn();
    const enterpriseSchema: WorkbenchSchema = {
      ...employeeSchema,
      schemaName: 'enterprise',
      label: 'Enterprise',
      displayProperty: 'code',
      displayProperties: ['code', 'tenant'],
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
        {
          name: 'tenant',
          label: 'Tenant',
          type: 'string',
          required: true,
          readOnly: false,
          primary: false,
          description: '',
          searchable: true,
        },
      ],
      relationships: [
        {
          field: 'tenant',
          label: 'Tenant',
          description: '',
          targetModule: 'profile',
          targetSchema: 'tenant',
          cardinality: 'ONE',
          referenceProperty: 'code',
          resolution: 'LOCAL_OR_REMOTE',
          actions: ['SELECT_EXISTING'],
          required: true,
          maximumDepth: 3,
        },
      ],
    };

    render(
      <AxisSchemaDataListing
        ariaLabel="Enterprise records"
        defaultVisibleColumnKeys={['code', 'tenant']}
        emptyMessage="No records"
        getRowKey={(record) => String(record.code)}
        records={[{ code: 'defaultEnterprise', tenant: 'default' }]}
        schema={enterpriseSchema}
        onReferenceClick={onReferenceClick}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'default' }));

    expect(onReferenceClick).toHaveBeenCalledWith(
      enterpriseSchema.relationships[0],
      'default',
      { code: 'defaultEnterprise', tenant: 'default' },
      0,
    );
    expect(onRowClick).not.toHaveBeenCalled();
  });

  it('renders one-to-many relationship columns as individual reference links', async () => {
    const user = userEvent.setup();
    const onReferenceClick = vi.fn();
    const onRowClick = vi.fn();
    const workflowActionSchema: WorkbenchSchema = {
      ...employeeSchema,
      moduleName: 'workflow',
      schemaName: 'workflowAction',
      label: 'Workflow Action',
      displayProperty: 'code',
      displayProperties: ['code'],
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
        {
          name: 'channels',
          label: 'Channels',
          type: 'array',
          required: false,
          readOnly: false,
          primary: false,
          description: '',
          searchable: false,
        },
      ],
      relationships: [
        {
          field: 'channels',
          label: 'Channels',
          description: '',
          targetModule: 'workflow',
          targetSchema: 'workflowChannel',
          cardinality: 'MANY',
          referenceProperty: 'code',
          resolution: 'LOCAL_OR_REMOTE',
          actions: ['SELECT_EXISTING'],
          required: false,
          maximumDepth: 3,
        },
      ],
    };

    render(
      <AxisSchemaDataListing
        ariaLabel="Workflow action records"
        defaultVisibleColumnKeys={['code', 'channels']}
        emptyMessage="No records"
        getRowKey={(record) => String(record.code)}
        records={[
          {
            code: 'reviewCmsPageAction',
            channels: ['publishCmsPageChannel', 'defaultRejectChannel'],
          },
        ]}
        schema={workflowActionSchema}
        onReferenceClick={onReferenceClick}
        onRowClick={onRowClick}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'defaultRejectChannel' }));

    expect(onReferenceClick).toHaveBeenCalledWith(
      workflowActionSchema.relationships[0],
      'defaultRejectChannel',
      {
        code: 'reviewCmsPageAction',
        channels: ['publishCmsPageChannel', 'defaultRejectChannel'],
      },
      0,
    );
    expect(onRowClick).not.toHaveBeenCalled();
  });
});
