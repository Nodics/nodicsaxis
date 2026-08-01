import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('opens referenced schema records from backend relationship descriptors', async () => {
    const user = userEvent.setup();
    const enterpriseSchema: WorkbenchSchema = {
      ...schema,
      schemaName: 'enterprise',
      label: 'Enterprise',
      fields: [
        ...schema.fields,
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
    const tenantSchema: WorkbenchSchema = {
      ...schema,
      schemaName: 'tenant',
      label: 'Tenant',
      fields: [
        ...schema.fields,
        {
          name: 'description',
          label: 'Description',
          type: 'string',
          required: false,
          readOnly: false,
          primary: false,
          description: '',
          searchable: true,
        },
      ],
    };
    const resolveRecord = vi.fn().mockResolvedValue({
      record: { code: 'default', description: 'Default tenant' },
      schema: tenantSchema,
    });

    render(
      <WorkbenchRecordDetail
        closeLabel="Close"
        deleteLabel="Delete"
        editLabel="Edit"
        falseLabel="No"
        record={{ code: 'defaultEnterprise', tenant: 'default' }}
        relationshipRuntime={{
          schemas: [tenantSchema],
          queryScope: ['default'],
          createRecord: vi.fn(),
          loadRecords: vi.fn(),
          resolveRecord,
        }}
        schema={enterpriseSchema}
        trueLabel="Yes"
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'default' }));

    expect(resolveRecord).toHaveBeenCalledWith(
      enterpriseSchema.relationships[0],
      'default',
    );
    expect(await screen.findByText('Default tenant')).toBeVisible();
  });

  it('opens individual references from one-to-many relationship fields', async () => {
    const user = userEvent.setup();
    const workflowActionSchema: WorkbenchSchema = {
      ...schema,
      moduleName: 'workflow',
      schemaName: 'workflowAction',
      label: 'Workflow Action',
      fields: [
        ...schema.fields,
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
    const workflowChannelSchema: WorkbenchSchema = {
      ...schema,
      moduleName: 'workflow',
      schemaName: 'workflowChannel',
      label: 'Channels',
      fields: [
        ...schema.fields,
        {
          name: 'target',
          label: 'Target',
          type: 'string',
          required: false,
          readOnly: false,
          primary: false,
          description: '',
          searchable: false,
        },
      ],
    };
    const resolveRecord = vi.fn().mockResolvedValue({
      record: { code: 'defaultRejectChannel', target: 'defaultRejectAction' },
      schema: workflowChannelSchema,
    });

    render(
      <WorkbenchRecordDetail
        closeLabel="Close"
        deleteLabel="Delete"
        editLabel="Edit"
        falseLabel="No"
        record={{
          code: 'reviewCmsPageAction',
          channels: ['publishCmsPageChannel', 'defaultRejectChannel'],
        }}
        relationshipRuntime={{
          schemas: [workflowChannelSchema],
          queryScope: ['default'],
          createRecord: vi.fn(),
          loadRecords: vi.fn(),
          resolveRecord,
        }}
        schema={workflowActionSchema}
        trueLabel="Yes"
        onClose={vi.fn()}
        onDelete={vi.fn()}
        onEdit={vi.fn()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'defaultRejectChannel' }));

    expect(resolveRecord).toHaveBeenCalledWith(
      workflowActionSchema.relationships[0],
      'defaultRejectChannel',
    );
    expect(await screen.findByText('Channels: defaultRejectChannel')).toBeVisible();
    expect(screen.getByText('defaultRejectAction')).toBeVisible();
  });
});
