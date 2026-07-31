import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import type { CmsComponentContract } from '../../../../../src/cms/cmsContract';
import { SchemaWorkbenchRenderer } from '../../../../../src/cms/renderers/components/workbench/SchemaWorkbenchRenderer';
import type { WorkbenchSchema } from '../../../../../src/workbench/api/workbenchContracts';

const component: CmsComponentContract = {
  code: 'axisSchemaWorkbenchComponent',
  typeCode: 'axisSchemaWorkbenchComponentType',
  renderer: 'axis.component.schema-workbench',
  rendererContractVersion: 1,
  rendererChannels: ['web', 'mobile-webview'],
  rendererDeprecated: false,
  properties: {
    title: 'Business data',
    introduction: 'Use authorized data types.',
    schemaSearchLabel: 'Find a data type',
    schemaSearchPlaceholder: 'Search types',
    schemasLabel: 'Available data types',
    recordsLabel: 'Records',
    noSchemasLabel: 'No data types',
    noRecordsLabel: 'No records',
    selectSchemaLabel: 'Select a data type',
    loadingLabel: 'Loading data',
    retryLabel: 'Try again',
    createLabel: 'Create',
    cancelLabel: 'Cancel',
    savingLabel: 'Saving',
    selectExistingLabel: 'Select existing',
    createRelatedLabel: 'Create related',
    editRelatedLabel: 'Edit related',
    addToDraftLabel: 'Add to draft',
    removeRelatedLabel: 'Close',
    noRelatedRecordsLabel: 'No related records',
    relatedSearchLabel: 'Search related records',
    actionsLabel: 'Actions',
    viewLabel: 'View',
    editLabel: 'Edit',
    updateLabel: 'Update',
    updatingLabel: 'Updating',
    closeLabel: 'Close',
    trueLabel: 'Yes',
    falseLabel: 'No',
    deleteLabel: 'Delete',
    deletingLabel: 'Deleting',
    confirmDeleteLabel: 'Delete record',
    deleteTitle: 'Delete this record?',
    deleteWarning: 'This action cannot be undone.',
    tenantLabel: 'Tenant',
    enterpriseLabel: 'Enterprise',
    searchRecordsLabel: 'Search records',
    searchRecordsPlaceholder: 'Search values',
    moduleLabel: 'Owning module',
    availableOperationsLabel: 'Available operations',
    resultsLabel: 'records',
    pageSizeLabel: 'Records per page',
    paginationLabel: 'Record pages',
    filterBuilderLabel: 'Advanced filters',
    addConditionLabel: 'Add condition',
    addGroupLabel: 'Add group',
    applyFiltersLabel: 'Apply filters',
    clearFiltersLabel: 'Clear filters',
    filterFieldLabel: 'Field',
    filterOperatorLabel: 'Operator',
    filterValueLabel: 'Value',
    filterMatchLabel: 'Match',
    removeFilterLabel: 'Remove',
    requestPreviewLabel: 'Request preview',
    addFavouriteLabel: 'Add favourite',
    removeFavouriteLabel: 'Remove favourite',
    gridSettingsLabel: 'Grid settings',
    savedViewNameLabel: 'View name',
    saveViewLabel: 'Save view',
    selectVisibleRecordsLabel: 'Select visible records',
    selectRecordLabel: 'Select record',
    selectedRecordsLabel: 'records selected',
  },
  slot: 'content',
  index: 20,
  components: [],
};

const address: WorkbenchSchema = {
  moduleName: 'profile',
  schemaName: 'address',
  label: 'Address',
  description: '',
  displayProperty: 'code',
  displayProperties: ['code'],
  queryCapabilities: {
    searchableFields: ['code', 'city'],
    sortableFields: ['code', 'city'],
    filterFields: [
      {
        field: 'city',
        label: 'City',
        type: 'string',
        operators: ['EQUALS', 'CONTAINS'],
      },
    ],
    groupOperators: ['AND', 'OR'],
    textOperator: 'CONTAINS',
    allowedPageSizes: [10, 25, 50],
    defaultPageSize: 25,
    maximumPageSize: 50,
    defaultSort: { field: 'code', direction: 'ASC' },
  },
  mutationMode: 'GENERATED_CRUD',
  operations: ['search', 'read', 'create', 'update', 'delete'],
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
      name: 'city',
      label: 'City',
      type: 'string',
      required: true,
      readOnly: false,
      primary: false,
      description: '',
      searchable: true,
    },
  ],
  relationships: [],
};

const relationshipRuntime = {
  schemas: [address],
  queryScope: ['default'],
  createRecord: vi.fn(),
  loadRecords: vi.fn(),
};

describe('SchemaWorkbenchRenderer', () => {
  it('selects an authorized schema and renders its records', async () => {
    const user = userEvent.setup();
    const selectSchema = vi.fn();
    const selectRecord = vi.fn();
    const setRecordFilters = vi.fn();
    const setRecordSortOverride = vi.fn();
    const { rerender } = render(
      <SchemaWorkbenchRenderer
        actions={{
          workbench: {
            schemas: [address],
            schemasLoading: false,
            records: [],
            recordSearch: '',
            recordPageNumber: 1,
            recordPageSize: 25,
            recordTotalCount: 0,
            recordSort: { field: 'code', direction: 'ASC' },
            visibleColumns: ['code', 'city'],
            favoriteSchemas: [],
            recentSchemas: [],
            selectedRecordKeys: [],
            savedViews: [],
            recordsLoading: false,
            creating: false,
            createOpen: false,
            relationshipRuntime,
            editOpen: false,
            updating: false,
            deleteOpen: false,
            deleting: false,
            tenantCode: 'default',
            enterpriseCode: 'default',
            selectSchema,
            setRecordSearch: vi.fn(),
            setRecordFilters,
            setRecordPageNumber: vi.fn(),
            setRecordPageSize: vi.fn(),
            setRecordSort: vi.fn(),
            setRecordSortOverride,
            setVisibleColumns: vi.fn(),
            toggleFavoriteSchema: vi.fn(),
            setSelectedRecordKeys: vi.fn(),
            saveView: vi.fn(),
            deleteView: vi.fn(),
            applyView: vi.fn(),
            beginCreate: vi.fn(),
            cancelCreate: vi.fn(),
            createRecord: vi.fn(),
            selectRecord,
            closeRecord: vi.fn(),
            beginEdit: vi.fn(),
            cancelEdit: vi.fn(),
            updateRecord: vi.fn(),
            beginDelete: vi.fn(),
            cancelDelete: vi.fn(),
            confirmDelete: vi.fn(),
            retrySchemas: vi.fn(),
            retryRecords: vi.fn(),
          },
        }}
        component={component}
      />,
    );

    await user.click(screen.getByRole('button', { name: /^Address profile$/ }));
    expect(selectSchema).toHaveBeenCalledWith(address);

    rerender(
      <SchemaWorkbenchRenderer
        actions={{
          workbench: {
            schemas: [address],
            schemasLoading: false,
            selectedSchema: address,
            records: [{ code: 'DXB-OFFICE', city: 'Dubai' }],
            recordSearch: '',
            recordPageNumber: 1,
            recordPageSize: 25,
            recordTotalCount: 1,
            recordSort: { field: 'code', direction: 'ASC' },
            visibleColumns: ['code', 'city'],
            favoriteSchemas: [],
            recentSchemas: [],
            selectedRecordKeys: [],
            savedViews: [],
            recordsLoading: false,
            creating: false,
            createOpen: false,
            relationshipRuntime,
            editOpen: false,
            updating: false,
            deleteOpen: false,
            deleting: false,
            tenantCode: 'default',
            enterpriseCode: 'default',
            selectSchema,
            setRecordSearch: vi.fn(),
            setRecordFilters,
            setRecordPageNumber: vi.fn(),
            setRecordPageSize: vi.fn(),
            setRecordSort: vi.fn(),
            setRecordSortOverride,
            setVisibleColumns: vi.fn(),
            toggleFavoriteSchema: vi.fn(),
            setSelectedRecordKeys: vi.fn(),
            saveView: vi.fn(),
            deleteView: vi.fn(),
            applyView: vi.fn(),
            beginCreate: vi.fn(),
            cancelCreate: vi.fn(),
            createRecord: vi.fn(),
            selectRecord,
            closeRecord: vi.fn(),
            beginEdit: vi.fn(),
            cancelEdit: vi.fn(),
            updateRecord: vi.fn(),
            beginDelete: vi.fn(),
            cancelDelete: vi.fn(),
            confirmDelete: vi.fn(),
            retrySchemas: vi.fn(),
            retryRecords: vi.fn(),
          },
        }}
        component={component}
      />,
    );
    expect(screen.getByRole('columnheader', { name: 'Code' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'DXB-OFFICE' })).toBeVisible();
    expect(screen.getByRole('cell', { name: 'Dubai' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Create Address' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Code' }));
    expect(setRecordSortOverride).toHaveBeenCalledWith({
      field: 'code',
      direction: 'ASC',
    });
    await user.click(screen.getByRole('button', { name: 'Advanced query' }));
    await user.click(screen.getByRole('button', { name: 'Add condition' }));
    expect(setRecordFilters).not.toHaveBeenCalled();
    await user.type(screen.getByLabelText('Value'), 'Dubai');
    await user.click(screen.getByRole('button', { name: 'Apply filters' }));
    expect(setRecordFilters).toHaveBeenCalledWith({
      operator: 'AND',
      items: [{ field: 'city', operator: 'EQUALS', value: 'Dubai' }],
    });
    await user.click(screen.getByRole('button', { name: 'View' }));
    expect(selectRecord).toHaveBeenCalledWith({
      code: 'DXB-OFFICE',
      city: 'Dubai',
    });
  });

  it('shows a retryable safe discovery failure', () => {
    render(
      <SchemaWorkbenchRenderer
        actions={{
          workbench: {
            schemas: [],
            schemasError: 'Authorized schema discovery is currently unavailable',
            schemasLoading: false,
            records: [],
            recordSearch: '',
            recordPageNumber: 1,
            recordPageSize: 25,
            recordTotalCount: 0,
            recordSort: { field: 'code', direction: 'ASC' },
            visibleColumns: [],
            favoriteSchemas: [],
            recentSchemas: [],
            selectedRecordKeys: [],
            savedViews: [],
            recordsLoading: false,
            creating: false,
            createOpen: false,
            relationshipRuntime,
            editOpen: false,
            updating: false,
            deleteOpen: false,
            deleting: false,
            tenantCode: 'default',
            enterpriseCode: 'default',
            selectSchema: vi.fn(),
            setRecordSearch: vi.fn(),
            setRecordFilters: vi.fn(),
            setRecordPageNumber: vi.fn(),
            setRecordPageSize: vi.fn(),
            setRecordSort: vi.fn(),
            setRecordSortOverride: vi.fn(),
            setVisibleColumns: vi.fn(),
            toggleFavoriteSchema: vi.fn(),
            setSelectedRecordKeys: vi.fn(),
            saveView: vi.fn(),
            deleteView: vi.fn(),
            applyView: vi.fn(),
            beginCreate: vi.fn(),
            cancelCreate: vi.fn(),
            createRecord: vi.fn(),
            selectRecord: vi.fn(),
            closeRecord: vi.fn(),
            beginEdit: vi.fn(),
            cancelEdit: vi.fn(),
            updateRecord: vi.fn(),
            beginDelete: vi.fn(),
            cancelDelete: vi.fn(),
            confirmDelete: vi.fn(),
            retrySchemas: vi.fn(),
            retryRecords: vi.fn(),
          },
        }}
        component={component}
      />,
    );

    expect(
      screen.getByText('Authorized schema discovery is currently unavailable'),
    ).toBeVisible();
    expect(screen.getByRole('button', { name: 'Try again' })).toBeVisible();
  });
});
