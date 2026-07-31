import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Divider,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  Stack,
  TablePagination,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { ShellIcon } from '../../../../app/shell/ShellIcon';
import { type AxisDataListingColumn } from '../../../../app/table/AxisDataListing';
import { AxisSchemaDataListing } from '../../../../app/table/AxisSchemaDataListing';
import type { WorkbenchRecord } from '../../../../workbench/api/workbenchContracts';
import { WorkbenchRecordDetail } from '../../../../workbench/detail/WorkbenchRecordDetail';
import { WorkbenchDeleteDialog } from '../../../../workbench/delete/WorkbenchDeleteDialog';
import { WorkbenchRecordForm } from '../../../../workbench/form/WorkbenchRecordForm';
import { stringProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';
import { SchemaQueryBuilderRenderer } from '../query/SchemaQueryBuilderRenderer';

function displayValue(value: unknown): string {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) return value.map(displayValue).join(', ');
  if (typeof value === 'object') return 'Related data';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }
  return '—';
}

function recordKey(record: WorkbenchRecord, index: number): string {
  const value = record._id ?? record.code;
  return typeof value === 'string' || typeof value === 'number'
    ? value.toString()
    : `record-${String(index)}`;
}

export function SchemaWorkbenchRenderer({
  component,
  actions,
}: CmsComponentRendererProps) {
  const controller = actions?.workbench;
  const [schemaQuery, setSchemaQuery] = useState('');
  const [advancedQueryOpen, setAdvancedQueryOpen] = useState(false);
  if (!controller) {
    throw new Error('Schema Workbench renderer requires its presentation controller');
  }
  const normalizedSchemaQuery = schemaQuery.trim().toLocaleLowerCase();
  const visibleSchemas = controller.schemas
    .filter((schema) =>
      normalizedSchemaQuery
        ? `${schema.label} ${schema.moduleName} ${schema.schemaName}`
            .toLocaleLowerCase()
            .includes(normalizedSchemaQuery)
        : true,
    )
    .sort((left, right) => {
      const leftKey = `${left.moduleName}:${left.schemaName}`;
      const rightKey = `${right.moduleName}:${right.schemaName}`;
      const leftRecent = controller.recentSchemas.indexOf(leftKey);
      const rightRecent = controller.recentSchemas.indexOf(rightKey);
      return (
        Number(controller.favoriteSchemas.includes(rightKey)) -
          Number(controller.favoriteSchemas.includes(leftKey)) ||
        (leftRecent < 0 ? Number.MAX_SAFE_INTEGER : leftRecent) -
          (rightRecent < 0 ? Number.MAX_SAFE_INTEGER : rightRecent) ||
        left.label.localeCompare(right.label)
      );
    });
  const selected = controller.selectedSchema;
  const columns =
    selected?.fields.filter((field) =>
      controller.visibleColumns.includes(field.name),
    ) ?? [];
  const records = controller.records;
  const leadingRecordColumns: readonly AxisDataListingColumn<WorkbenchRecord>[] =
    selected
      ? [
          {
            key: '__select',
            label: (
              <Checkbox
                slotProps={{
                  input: {
                    'aria-label': stringProperty(
                      component,
                      'selectVisibleRecordsLabel',
                    ),
                  },
                }}
                checked={
                  records.length > 0 &&
                  records.every((record, index) =>
                    controller.selectedRecordKeys.includes(recordKey(record, index)),
                  )
                }
                indeterminate={
                  records.some((record, index) =>
                    controller.selectedRecordKeys.includes(recordKey(record, index)),
                  ) &&
                  !records.every((record, index) =>
                    controller.selectedRecordKeys.includes(recordKey(record, index)),
                  )
                }
                onChange={() => {
                  const pageKeys = records.map(recordKey);
                  const allSelected = pageKeys.every((key) =>
                    controller.selectedRecordKeys.includes(key),
                  );
                  controller.setSelectedRecordKeys(
                    allSelected
                      ? controller.selectedRecordKeys.filter(
                          (key) => !pageKeys.includes(key),
                        )
                      : [...new Set([...controller.selectedRecordKeys, ...pageKeys])],
                  );
                }}
              />
            ),
            width: 52,
            minWidth: 52,
            exportable: false,
            render: (record, index) => {
              const key = recordKey(record, index);
              return (
                <Checkbox
                  slotProps={{
                    input: {
                      'aria-label': `${stringProperty(component, 'selectRecordLabel')} ${key}`,
                    },
                  }}
                  checked={controller.selectedRecordKeys.includes(key)}
                  onChange={() => {
                    controller.setSelectedRecordKeys(
                      controller.selectedRecordKeys.includes(key)
                        ? controller.selectedRecordKeys.filter(
                            (candidate) => candidate !== key,
                          )
                        : [...controller.selectedRecordKeys, key],
                    );
                  }}
                />
              );
            },
          },
        ]
      : [];
  const trailingRecordColumns: readonly AxisDataListingColumn<WorkbenchRecord>[] =
    selected
      ? [
          {
            key: '__actions',
            label: stringProperty(component, 'actionsLabel'),
            width: 120,
            minWidth: 120,
            exportable: false,
            render: (record) => (
              <Button size="small" onClick={() => controller.selectRecord(record)}>
                {stringProperty(component, 'viewLabel')}
              </Button>
            ),
          },
        ]
      : [];
  const pageCount = Math.max(
    1,
    Math.ceil(controller.recordTotalCount / controller.recordPageSize),
  );

  return (
    <Stack spacing={2}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '360px minmax(0, 1fr)' },
        }}
      >
        <Card component="aside" variant="outlined">
          <CardContent>
            <Stack spacing={1.5}>
              <Typography component="h2" variant="h6">
                {stringProperty(component, 'schemasLabel')}
              </Typography>
              <TextField
                fullWidth
                label={stringProperty(component, 'schemaSearchLabel')}
                placeholder={stringProperty(component, 'schemaSearchPlaceholder')}
                size="small"
                sx={{
                  '& .MuiInputBase-input': {
                    minWidth: 0,
                    textOverflow: 'ellipsis',
                  },
                }}
                value={schemaQuery}
                slotProps={{
                  input: {
                    startAdornment: (
                      <InputAdornment position="start">
                        <ShellIcon fontSize="small" name="search" />
                      </InputAdornment>
                    ),
                  },
                }}
                onChange={(event) => setSchemaQuery(event.target.value)}
              />
              {controller.schemasLoading ? (
                <Stack
                  direction="row"
                  spacing={1.5}
                  sx={{ alignItems: 'center', py: 3 }}
                >
                  <CircularProgress size={22} />
                  <Typography>{stringProperty(component, 'loadingLabel')}</Typography>
                </Stack>
              ) : null}
              {controller.schemasError ? (
                <Alert
                  action={
                    <Button
                      color="inherit"
                      size="small"
                      onClick={controller.retrySchemas}
                    >
                      {stringProperty(component, 'retryLabel')}
                    </Button>
                  }
                  severity="error"
                >
                  {controller.schemasError}
                </Alert>
              ) : null}
              {!controller.schemasLoading &&
              !controller.schemasError &&
              visibleSchemas.length === 0 ? (
                <Typography color="text.secondary">
                  {stringProperty(component, 'noSchemasLabel')}
                </Typography>
              ) : null}
              <List
                disablePadding
                aria-label={stringProperty(component, 'schemasLabel')}
              >
                {visibleSchemas.map((schema) => {
                  const key = `${schema.moduleName}:${schema.schemaName}`;
                  const favorite = controller.favoriteSchemas.includes(key);
                  return (
                    <Stack
                      key={key}
                      direction="row"
                      sx={{ alignItems: 'center', mb: 0.5 }}
                    >
                      <ListItemButton
                        selected={
                          selected?.moduleName === schema.moduleName &&
                          selected.schemaName === schema.schemaName
                        }
                        sx={{ borderRadius: 1.5 }}
                        onClick={() => controller.selectSchema(schema)}
                      >
                        <ListItemText
                          primary={schema.label}
                          secondary={schema.moduleName}
                          slotProps={{ primary: { sx: { fontWeight: 600 } } }}
                        />
                      </ListItemButton>
                      <Button
                        aria-label={`${stringProperty(
                          component,
                          favorite ? 'removeFavouriteLabel' : 'addFavouriteLabel',
                        )} ${schema.label}`}
                        color={favorite ? 'primary' : 'inherit'}
                        sx={{ minWidth: 36, px: 0.5 }}
                        onClick={() => controller.toggleFavoriteSchema(schema)}
                      >
                        {favorite ? '★' : '☆'}
                      </Button>
                    </Stack>
                  );
                })}
              </List>
            </Stack>
          </CardContent>
        </Card>
        <Card component="section" variant="outlined">
          <CardContent>
            {!selected ? (
              <Stack
                sx={{ alignItems: 'center', minHeight: 320, justifyContent: 'center' }}
              >
                <ShellIcon color="disabled" name="schema" sx={{ fontSize: 48 }} />
                <Typography color="text.secondary" sx={{ mt: 1.5 }}>
                  {stringProperty(component, 'selectSchemaLabel')}
                </Typography>
              </Stack>
            ) : (
              <Stack spacing={1.5}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{
                    alignItems: { sm: 'flex-start' },
                    justifyContent: 'space-between',
                  }}
                >
                  <Stack spacing={0.75} sx={{ minWidth: 0 }}>
                    <Typography component="h2" variant="h5" sx={{ fontWeight: 750 }}>
                      {selected.label}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      sx={{ alignItems: 'center', flexWrap: 'wrap' }}
                      useFlexGap
                    >
                      <Chip
                        label={`${stringProperty(component, 'moduleLabel')}: ${selected.moduleName}`}
                        size="small"
                        variant="outlined"
                      />
                      {selected.operations.map((operation) => (
                        <Chip
                          key={operation}
                          label={operation}
                          size="small"
                          sx={{ bgcolor: 'action.selected' }}
                        />
                      ))}
                    </Stack>
                  </Stack>
                  {selected.operations.includes('create') ? (
                    <Button
                      disabled={controller.createOpen}
                      startIcon={<ShellIcon name="add" />}
                      variant="contained"
                      onClick={controller.beginCreate}
                    >
                      {stringProperty(component, 'createLabel')} {selected.label}
                    </Button>
                  ) : null}
                </Stack>
                <Divider />
                {controller.selectedRecord ? (
                  <>
                    {controller.editOpen ? (
                      <WorkbenchRecordForm
                        key={recordKey(controller.selectedRecord, 0)}
                        cancelLabel={stringProperty(component, 'cancelLabel')}
                        error={controller.updateError}
                        initialModel={controller.selectedRecord}
                        relationshipCopy={{
                          addToDraftLabel: stringProperty(component, 'addToDraftLabel'),
                          cancelLabel: stringProperty(component, 'cancelLabel'),
                          createRelatedLabel: stringProperty(
                            component,
                            'createRelatedLabel',
                          ),
                          editRelatedLabel: stringProperty(
                            component,
                            'editRelatedLabel',
                          ),
                          noRelatedRecordsLabel: stringProperty(
                            component,
                            'noRelatedRecordsLabel',
                          ),
                          relatedSearchLabel: stringProperty(
                            component,
                            'relatedSearchLabel',
                          ),
                          removeRelatedLabel: stringProperty(
                            component,
                            'removeRelatedLabel',
                          ),
                          selectExistingLabel: stringProperty(
                            component,
                            'selectExistingLabel',
                          ),
                        }}
                        relationshipRuntime={controller.relationshipRuntime}
                        saving={controller.updating}
                        savingLabel={stringProperty(component, 'updatingLabel')}
                        schema={selected}
                        submitLabel={stringProperty(component, 'updateLabel')}
                        onCancel={controller.cancelEdit}
                        onSubmit={controller.updateRecord}
                      />
                    ) : (
                      <WorkbenchRecordDetail
                        closeLabel={stringProperty(component, 'closeLabel')}
                        deleteLabel={stringProperty(component, 'deleteLabel')}
                        editLabel={stringProperty(component, 'editLabel')}
                        falseLabel={stringProperty(component, 'falseLabel')}
                        record={controller.selectedRecord}
                        schema={selected}
                        trueLabel={stringProperty(component, 'trueLabel')}
                        onClose={controller.closeRecord}
                        onDelete={controller.beginDelete}
                        onEdit={controller.beginEdit}
                      />
                    )}
                    <Divider />
                  </>
                ) : null}
                {controller.createOpen ? (
                  <>
                    <WorkbenchRecordForm
                      cancelLabel={stringProperty(component, 'cancelLabel')}
                      error={controller.createError}
                      relationshipCopy={{
                        addToDraftLabel: stringProperty(component, 'addToDraftLabel'),
                        cancelLabel: stringProperty(component, 'cancelLabel'),
                        createRelatedLabel: stringProperty(
                          component,
                          'createRelatedLabel',
                        ),
                        editRelatedLabel: stringProperty(component, 'editRelatedLabel'),
                        noRelatedRecordsLabel: stringProperty(
                          component,
                          'noRelatedRecordsLabel',
                        ),
                        relatedSearchLabel: stringProperty(
                          component,
                          'relatedSearchLabel',
                        ),
                        removeRelatedLabel: stringProperty(
                          component,
                          'removeRelatedLabel',
                        ),
                        selectExistingLabel: stringProperty(
                          component,
                          'selectExistingLabel',
                        ),
                      }}
                      relationshipRuntime={controller.relationshipRuntime}
                      saving={controller.creating}
                      savingLabel={stringProperty(component, 'savingLabel')}
                      schema={selected}
                      submitLabel={stringProperty(component, 'createLabel')}
                      onCancel={controller.cancelCreate}
                      onSubmit={controller.createRecord}
                    />
                    <Divider />
                  </>
                ) : null}
                <Box hidden={controller.createOpen || controller.editOpen}>
                  <Stack spacing={1.25}>
                    <Box
                      sx={{
                        bgcolor: 'background.default',
                        border: 1,
                        borderColor: 'divider',
                        borderRadius: 2,
                        p: 1,
                      }}
                    >
                      <Stack spacing={1.25}>
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          spacing={1}
                          sx={{ alignItems: { md: 'center' } }}
                        >
                          <TextField
                            fullWidth
                            placeholder={stringProperty(
                              component,
                              'searchRecordsPlaceholder',
                            )}
                            size="small"
                            value={controller.recordSearch}
                            disabled={
                              selected.queryCapabilities.searchableFields.length === 0
                            }
                            slotProps={{
                              htmlInput: {
                                'aria-label': stringProperty(
                                  component,
                                  'searchRecordsLabel',
                                ),
                              },
                              input: {
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <ShellIcon fontSize="small" name="search" />
                                  </InputAdornment>
                                ),
                              },
                            }}
                            onChange={(event) =>
                              controller.setRecordSearch(event.target.value)
                            }
                          />
                          <Button
                            color="inherit"
                            endIcon={
                              <ShellIcon
                                fontSize="small"
                                name={
                                  advancedQueryOpen
                                    ? 'chevron-up'
                                    : 'chevron-down'
                                }
                              />
                            }
                            sx={{ flex: { md: '0 0 auto' }, minHeight: 40 }}
                            variant="outlined"
                            onClick={() => setAdvancedQueryOpen((open) => !open)}
                          >
                            Advanced query
                          </Button>
                        </Stack>
                        <Collapse
                          in={advancedQueryOpen || Boolean(controller.recordFilters)}
                          timeout="auto"
                          unmountOnExit
                        >
                          <SchemaQueryBuilderRenderer
                            actions={actions}
                            component={component}
                          />
                        </Collapse>
                      </Stack>
                    </Box>
                  </Stack>
                  {controller.recordsLoading ? (
                    <Stack
                      direction="row"
                      spacing={1.5}
                      sx={{ alignItems: 'center', py: 4 }}
                    >
                      <CircularProgress size={22} />
                      <Typography>
                        {stringProperty(component, 'loadingLabel')}
                      </Typography>
                    </Stack>
                  ) : null}
                  {controller.recordsError ? (
                    <Alert
                      action={
                        <Button
                          color="inherit"
                          size="small"
                          onClick={controller.retryRecords}
                        >
                          {stringProperty(component, 'retryLabel')}
                        </Button>
                      }
                      severity="error"
                      sx={{ mt: 1.25 }}
                    >
                      {controller.recordsError}
                    </Alert>
                  ) : null}
                  {!controller.recordsLoading && !controller.recordsError ? (
                    <AxisSchemaDataListing
                      ariaLabel={`${selected.label} ${stringProperty(component, 'recordsLabel')}`}
                      columnsLabel={stringProperty(
                        component,
                        'gridSettingsLabel',
                        'Columns',
                      )}
                      defaultVisibleColumnKeys={columns.map((field) => field.name)}
                      emptyMessage={stringProperty(component, 'noRecordsLabel')}
                      exportFileName={`axis-${selected.moduleName}-${selected.schemaName}`}
                      footer={
                        controller.recordTotalCount > 0 ? (
                          <TablePagination
                            component="div"
                            count={controller.recordTotalCount}
                            page={Math.min(controller.recordPageNumber, pageCount) - 1}
                            rowsPerPage={controller.recordPageSize}
                            rowsPerPageOptions={
                              selected.queryCapabilities.allowedPageSizes
                            }
                            sx={{
                              border: 0,
                              bgcolor: 'background.paper',
                              '& .MuiToolbar-root': {
                                minHeight: 52,
                                px: 1.5,
                              },
                            }}
                            onPageChange={(_event, page) =>
                              controller.setRecordPageNumber(page + 1)
                            }
                            onRowsPerPageChange={(event) =>
                              controller.setRecordPageSize(Number(event.target.value))
                            }
                          />
                        ) : null
                      }
                      getRowKey={recordKey}
                      leadingColumns={leadingRecordColumns}
                      maxBodyHeight="100%"
                      minTableWidth={Math.max(720, 220 + columns.length * 160)}
                      records={records}
                      schema={selected}
                      sortOverride={controller.recordSortOverride}
                      trailingColumns={trailingRecordColumns}
                      toolbarStart={
                        <Typography color="text.secondary" variant="body2">
                          {controller.recordTotalCount}{' '}
                          {stringProperty(component, 'resultsLabel')}
                        </Typography>
                      }
                      onColumnKeysChange={(columnKeys) =>
                        controller.setVisibleColumns(columnKeys)
                      }
                      onSortOverrideChange={controller.setRecordSortOverride}
                      visibleColumnKeys={controller.visibleColumns}
                    />
                  ) : null}
                  {controller.selectedRecordKeys.length > 0 ? (
                    <Alert
                      action={
                        selected.bulkCapabilities?.operations.includes('DELETE') &&
                        controller.bulkDeleteSelected ? (
                          <Button
                            color="inherit"
                            disabled={controller.bulkDeleting}
                            size="small"
                            onClick={() => void controller.bulkDeleteSelected?.()}
                          >
                            {controller.bulkDeleting
                              ? stringProperty(component, 'bulkDeletingLabel')
                              : stringProperty(component, 'bulkDeleteLabel')}
                          </Button>
                        ) : undefined
                      }
                      severity={controller.bulkDeleteError ? 'error' : 'info'}
                    >
                      {controller.bulkDeleteError ??
                        `${String(controller.selectedRecordKeys.length)} ${stringProperty(
                          component,
                          'selectedRecordsLabel',
                        )}`}
                    </Alert>
                  ) : null}
                </Box>
              </Stack>
            )}
          </CardContent>
        </Card>
      </Box>
      {controller.selectedRecord ? (
        <WorkbenchDeleteDialog
          cancelLabel={stringProperty(component, 'cancelLabel')}
          confirmLabel={stringProperty(component, 'confirmDeleteLabel')}
          deleting={controller.deleting}
          deletingLabel={stringProperty(component, 'deletingLabel')}
          enterpriseCode={controller.enterpriseCode}
          enterpriseLabel={stringProperty(component, 'enterpriseLabel')}
          error={controller.deleteError}
          impact={controller.deleteImpact}
          impactBlockedLabel={stringProperty(component, 'deleteImpactBlockedLabel')}
          impactClearLabel={stringProperty(component, 'deleteImpactClearLabel')}
          impactLoading={controller.deleteImpactLoading ?? false}
          impactLoadingLabel={stringProperty(component, 'deleteImpactLoadingLabel')}
          identity={displayValue(
            controller.selectedRecord[selected?.displayProperty ?? 'code'],
          )}
          open={controller.deleteOpen}
          schemaLabel={selected?.label ?? ''}
          tenantCode={controller.tenantCode}
          tenantLabel={stringProperty(component, 'tenantLabel')}
          title={stringProperty(component, 'deleteTitle')}
          warning={stringProperty(component, 'deleteWarning')}
          onCancel={controller.cancelDelete}
          onConfirm={controller.confirmDelete}
        />
      ) : null}
    </Stack>
  );
}
