import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  InputAdornment,
  List,
  ListItemButton,
  ListItemText,
  MenuItem,
  Pagination,
  Paper,
  Stack,
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import { ShellIcon } from '../../../../app/shell/ShellIcon';
import type { WorkbenchRecord } from '../../../../workbench/api/workbenchContracts';
import { WorkbenchRecordDetail } from '../../../../workbench/detail/WorkbenchRecordDetail';
import { WorkbenchDeleteDialog } from '../../../../workbench/delete/WorkbenchDeleteDialog';
import { WorkbenchRecordForm } from '../../../../workbench/form/WorkbenchRecordForm';
import { WorkbenchFilterBuilder } from '../../../../workbench/query/WorkbenchFilterBuilder';
import { stringProperty } from '../../shared/rendererProperties';
import type { CmsComponentRendererProps } from '../../shared/rendererTypes';

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
  const [viewName, setViewName] = useState('');
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
  const pageCount = Math.max(
    1,
    Math.ceil(controller.recordTotalCount / controller.recordPageSize),
  );

  return (
    <Stack spacing={2}>
      <Box>
        <Typography component="h1" variant="h4">
          {stringProperty(component, 'title')}
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.75 }}>
          {stringProperty(component, 'introduction')}
        </Typography>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '300px minmax(0, 1fr)' },
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
              <Stack spacing={2}>
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1.5}
                  sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
                >
                  <Box>
                    <Typography component="h2" variant="h5">
                      {selected.label}
                    </Typography>
                    <Typography color="text.secondary" variant="body2">
                      {stringProperty(component, 'moduleLabel')}: {selected.moduleName}
                    </Typography>
                  </Box>
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
                <Stack direction="row" spacing={0.75} sx={{ flexWrap: 'wrap' }}>
                  <Typography color="text.secondary" variant="caption">
                    {stringProperty(component, 'availableOperationsLabel')}:
                  </Typography>
                  {selected.operations.map((operation) => (
                    <Chip
                      key={operation}
                      label={operation}
                      size="small"
                      variant="outlined"
                    />
                  ))}
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
                  <TextField
                    fullWidth
                    label={stringProperty(component, 'searchRecordsLabel')}
                    placeholder={stringProperty(component, 'searchRecordsPlaceholder')}
                    size="small"
                    value={controller.recordSearch}
                    disabled={selected.queryCapabilities.searchableFields.length === 0}
                    onChange={(event) => controller.setRecordSearch(event.target.value)}
                  />
                  <WorkbenchFilterBuilder
                    key={`${selected.moduleName}:${selected.schemaName}:${JSON.stringify(controller.recordFilters ?? null)}`}
                    capabilities={selected.queryCapabilities}
                    copy={{
                      addConditionLabel: stringProperty(component, 'addConditionLabel'),
                      addGroupLabel: stringProperty(component, 'addGroupLabel'),
                      applyFiltersLabel: stringProperty(component, 'applyFiltersLabel'),
                      clearFiltersLabel: stringProperty(component, 'clearFiltersLabel'),
                      fieldLabel: stringProperty(component, 'filterFieldLabel'),
                      filterBuilderLabel: stringProperty(
                        component,
                        'filterBuilderLabel',
                      ),
                      matchLabel: stringProperty(component, 'filterMatchLabel'),
                      operatorLabel: stringProperty(component, 'filterOperatorLabel'),
                      removeLabel: stringProperty(component, 'removeFilterLabel'),
                      requestPreviewLabel: stringProperty(
                        component,
                        'requestPreviewLabel',
                      ),
                      valueLabel: stringProperty(component, 'filterValueLabel'),
                    }}
                    value={controller.recordFilters}
                    onChange={controller.setRecordFilters}
                  />
                  <Paper sx={{ p: 1.5 }} variant="outlined">
                    <Stack spacing={1.25}>
                      <Typography component="h3" variant="subtitle1">
                        {stringProperty(component, 'gridSettingsLabel')}
                      </Typography>
                      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }}>
                        {selected.fields.slice(0, 20).map((field) => (
                          <FormControlLabel
                            key={field.name}
                            control={
                              <Checkbox
                                checked={controller.visibleColumns.includes(field.name)}
                                disabled={
                                  controller.visibleColumns.length === 1 &&
                                  controller.visibleColumns.includes(field.name)
                                }
                                onChange={() =>
                                  controller.setVisibleColumns(
                                    controller.visibleColumns.includes(field.name)
                                      ? controller.visibleColumns.filter(
                                          (name) => name !== field.name,
                                        )
                                      : [...controller.visibleColumns, field.name],
                                  )
                                }
                              />
                            }
                            label={field.label}
                          />
                        ))}
                      </Stack>
                      <Stack
                        direction={{ xs: 'column', md: 'row' }}
                        spacing={1}
                        sx={{ alignItems: { md: 'center' } }}
                      >
                        <TextField
                          label={stringProperty(component, 'savedViewNameLabel')}
                          size="small"
                          value={viewName}
                          onChange={(event) => setViewName(event.target.value)}
                        />
                        <Button
                          disabled={viewName.trim().length === 0}
                          onClick={() => {
                            controller.saveView({
                              name: viewName.trim(),
                              search: controller.recordSearch,
                              filters: controller.recordFilters,
                              pageSize: controller.recordPageSize,
                              sort: controller.recordSort,
                              visibleColumns: controller.visibleColumns,
                            });
                            setViewName('');
                          }}
                        >
                          {stringProperty(component, 'saveViewLabel')}
                        </Button>
                        {controller.savedViews.map((view) => (
                          <Chip
                            key={view.name}
                            label={view.name}
                            onClick={() => controller.applyView(view)}
                            onDelete={() => controller.deleteView(view.name)}
                          />
                        ))}
                      </Stack>
                    </Stack>
                  </Paper>
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
                    >
                      {controller.recordsError}
                    </Alert>
                  ) : null}
                  {!controller.recordsLoading &&
                  !controller.recordsError &&
                  records.length === 0 ? (
                    <Typography
                      color="text.secondary"
                      sx={{ py: 4, textAlign: 'center' }}
                    >
                      {stringProperty(component, 'noRecordsLabel')}
                    </Typography>
                  ) : null}
                  {records.length > 0 ? (
                    <Box sx={{ overflowX: 'auto' }}>
                      <Box
                        role="table"
                        aria-label={`${selected.label} ${stringProperty(component, 'recordsLabel')}`}
                        sx={{ minWidth: 620 }}
                      >
                        <Box
                          role="row"
                          sx={{
                            bgcolor: 'action.hover',
                            display: 'grid',
                            gap: 2,
                            gridTemplateColumns: `44px repeat(${String(columns.length)}, minmax(120px, 1fr)) auto`,
                            px: 1.5,
                            py: 1.25,
                          }}
                        >
                          <Box role="columnheader">
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
                                  controller.selectedRecordKeys.includes(
                                    recordKey(record, index),
                                  ),
                                )
                              }
                              indeterminate={
                                records.some((record, index) =>
                                  controller.selectedRecordKeys.includes(
                                    recordKey(record, index),
                                  ),
                                ) &&
                                !records.every((record, index) =>
                                  controller.selectedRecordKeys.includes(
                                    recordKey(record, index),
                                  ),
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
                                    : [
                                        ...new Set([
                                          ...controller.selectedRecordKeys,
                                          ...pageKeys,
                                        ]),
                                      ],
                                );
                              }}
                            />
                          </Box>
                          {columns.map((field) => (
                            <Box key={field.name} role="columnheader">
                              {selected.queryCapabilities.sortableFields.includes(
                                field.name,
                              ) ? (
                                <TableSortLabel
                                  active={controller.recordSort.field === field.name}
                                  direction={
                                    controller.recordSort.field === field.name
                                      ? (controller.recordSort.direction.toLowerCase() as
                                          | 'asc'
                                          | 'desc')
                                      : 'asc'
                                  }
                                  onClick={() =>
                                    controller.setRecordSort({
                                      field: field.name,
                                      direction:
                                        controller.recordSort.field === field.name &&
                                        controller.recordSort.direction === 'ASC'
                                          ? 'DESC'
                                          : 'ASC',
                                    })
                                  }
                                >
                                  <Typography sx={{ fontWeight: 700 }} variant="body2">
                                    {field.label}
                                  </Typography>
                                </TableSortLabel>
                              ) : (
                                <Typography sx={{ fontWeight: 700 }} variant="body2">
                                  {field.label}
                                </Typography>
                              )}
                            </Box>
                          ))}
                          <Typography
                            role="columnheader"
                            sx={{ fontWeight: 700 }}
                            variant="body2"
                          >
                            {stringProperty(component, 'actionsLabel')}
                          </Typography>
                        </Box>
                        {records.map((record, index) => (
                          <Box
                            key={recordKey(record, index)}
                            role="row"
                            sx={{
                              borderBottom: 1,
                              borderColor: 'divider',
                              display: 'grid',
                              gap: 2,
                              gridTemplateColumns: `44px repeat(${String(columns.length)}, minmax(120px, 1fr)) auto`,
                              px: 1.5,
                              py: 1.25,
                            }}
                          >
                            <Box role="cell">
                              <Checkbox
                                slotProps={{
                                  input: {
                                    'aria-label': `${stringProperty(component, 'selectRecordLabel')} ${recordKey(record, index)}`,
                                  },
                                }}
                                checked={controller.selectedRecordKeys.includes(
                                  recordKey(record, index),
                                )}
                                onChange={() => {
                                  const key = recordKey(record, index);
                                  controller.setSelectedRecordKeys(
                                    controller.selectedRecordKeys.includes(key)
                                      ? controller.selectedRecordKeys.filter(
                                          (candidate) => candidate !== key,
                                        )
                                      : [...controller.selectedRecordKeys, key],
                                  );
                                }}
                              />
                            </Box>
                            {columns.map((field) => (
                              <Typography key={field.name} role="cell" variant="body2">
                                {displayValue(record[field.name])}
                              </Typography>
                            ))}
                            <Button
                              size="small"
                              onClick={() => controller.selectRecord(record)}
                            >
                              {stringProperty(component, 'viewLabel')}
                            </Button>
                          </Box>
                        ))}
                      </Box>
                    </Box>
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
                  {!controller.recordsLoading &&
                  !controller.recordsError &&
                  controller.recordTotalCount > 0 ? (
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      spacing={2}
                      sx={{
                        alignItems: { sm: 'center' },
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography color="text.secondary" variant="body2">
                        {controller.recordTotalCount}{' '}
                        {stringProperty(component, 'resultsLabel')}
                      </Typography>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        sx={{ alignItems: { sm: 'center' } }}
                      >
                        <TextField
                          select
                          label={stringProperty(component, 'pageSizeLabel')}
                          size="small"
                          value={controller.recordPageSize}
                          onChange={(event) =>
                            controller.setRecordPageSize(Number(event.target.value))
                          }
                        >
                          {selected.queryCapabilities.allowedPageSizes.map((size) => (
                            <MenuItem key={size} value={size}>
                              {size}
                            </MenuItem>
                          ))}
                        </TextField>
                        <Pagination
                          aria-label={stringProperty(component, 'paginationLabel')}
                          count={pageCount}
                          page={Math.min(controller.recordPageNumber, pageCount)}
                          shape="rounded"
                          onChange={(_event, page) =>
                            controller.setRecordPageNumber(page)
                          }
                        />
                      </Stack>
                    </Stack>
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
