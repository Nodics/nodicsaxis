import {
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';

import type {
  WorkbenchFilterCondition,
  WorkbenchFilterField,
  WorkbenchFilterGroup,
  WorkbenchFilterOperator,
  WorkbenchQueryCapabilities,
  WorkbenchRecordQuery,
} from '../../workbench/api/workbenchContracts';

export interface SchemaQueryBuilderCopy {
  readonly addConditionLabel: string;
  readonly addGroupLabel: string;
  readonly applyFiltersLabel: string;
  readonly ascendingLabel?: string;
  readonly clearFiltersLabel: string;
  readonly descendingLabel?: string;
  readonly fieldLabel: string;
  readonly filterBuilderLabel: string;
  readonly matchLabel: string;
  readonly noFiltersSummaryLabel?: string;
  readonly operatorLabel: string;
  readonly removeLabel: string;
  readonly requestPreviewLabel: string;
  readonly sortBuilderLabel?: string;
  readonly sortDirectionLabel?: string;
  readonly sortFieldLabel?: string;
  readonly valueLabel: string;
}

export interface SchemaQueryBuilderProps {
  readonly capabilities: WorkbenchQueryCapabilities;
  readonly copy: SchemaQueryBuilderCopy;
  readonly sort?: WorkbenchRecordQuery['sort'] | undefined;
  readonly value?: WorkbenchFilterGroup | undefined;
  readonly onChange: (value?: WorkbenchFilterGroup) => void;
  readonly onSortChange?: (sort: WorkbenchRecordQuery['sort']) => void;
  readonly showTechnicalPreview?: boolean;
}

const operatorLabels: Readonly<Record<WorkbenchFilterOperator, string>> = {
  EQUALS: 'Equals',
  NOT_EQUALS: 'Does not equal',
  CONTAINS: 'Contains',
  STARTS_WITH: 'Starts with',
  GREATER_THAN: 'Greater than',
  GREATER_OR_EQUAL: 'Greater than or equal',
  LESS_THAN: 'Less than',
  LESS_OR_EQUAL: 'Less than or equal',
  BEFORE: 'Before',
  AFTER: 'After',
  BETWEEN: 'Between',
  IN: 'Any of',
};

function initialCondition(field: WorkbenchFilterField): WorkbenchFilterCondition {
  return {
    field: field.field,
    operator: field.operators[0] ?? 'EQUALS',
    value: ['boolean', 'bool'].includes(field.type)
      ? true
      : ['number', 'int', 'integer'].includes(field.type)
        ? 0
        : '',
  };
}

function isGroup(
  item: WorkbenchFilterCondition | WorkbenchFilterGroup,
): item is WorkbenchFilterGroup {
  return 'items' in item;
}

function replaceAtPath(
  group: WorkbenchFilterGroup,
  path: readonly number[],
  replacement?: WorkbenchFilterCondition | WorkbenchFilterGroup,
): WorkbenchFilterGroup | undefined {
  const [index, ...rest] = path;
  if (index === undefined) return group;
  const items = [...group.items];
  const current = items[index];
  if (rest.length > 0) {
    if (!current || !isGroup(current)) return group;
    const nested = replaceAtPath(current, rest, replacement);
    if (nested) items[index] = nested;
    else items.splice(index, 1);
  } else if (replacement) {
    items[index] = replacement;
  } else {
    items.splice(index, 1);
  }
  return items.length > 0 ? { ...group, items } : undefined;
}

function valueFromInput(
  raw: string,
  field: WorkbenchFilterField,
  operator: WorkbenchFilterOperator,
): WorkbenchFilterCondition['value'] {
  if (operator === 'IN' || operator === 'BETWEEN') {
    return raw
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
  if (['number', 'int', 'integer'].includes(field.type)) return Number(raw);
  if (['boolean', 'bool'].includes(field.type)) return raw === 'true';
  return raw;
}

function titleCase(value: string): string {
  return value
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function labelForField(
  capabilities: WorkbenchQueryCapabilities,
  fieldName: string,
): string {
  return (
    capabilities.filterFields.find((field) => field.field === fieldName)?.label ??
    titleCase(fieldName)
  );
}

function sortOrDefault(
  capabilities: WorkbenchQueryCapabilities,
  sort: WorkbenchRecordQuery['sort'] | undefined,
): WorkbenchRecordQuery['sort'] | undefined {
  if (sort && capabilities.sortableFields.includes(sort.field)) return sort;
  if (
    capabilities.defaultSort &&
    capabilities.sortableFields.includes(capabilities.defaultSort.field)
  ) {
    return capabilities.defaultSort;
  }
  const fallback = capabilities.sortableFields[0];
  return fallback ? { field: fallback, direction: 'ASC' } : undefined;
}

function completeCondition(
  item: WorkbenchFilterCondition,
  capabilities: WorkbenchQueryCapabilities,
): boolean {
  const field = capabilities.filterFields.find(
    (candidate) => candidate.field === item.field,
  );
  if (!field || !field.operators.includes(item.operator)) return false;
  if (Array.isArray(item.value)) {
    return (
      item.value.length > 0 && (item.operator !== 'BETWEEN' || item.value.length === 2)
    );
  }
  if (typeof item.value === 'number') return Number.isFinite(item.value);
  return typeof item.value !== 'string' || item.value.trim().length > 0;
}

function completeGroup(
  group: WorkbenchFilterGroup,
  capabilities: WorkbenchQueryCapabilities,
): boolean {
  return (
    group.items.length > 0 &&
    group.items.every((item) =>
      isGroup(item)
        ? completeGroup(item, capabilities)
        : completeCondition(item, capabilities),
    )
  );
}

function completeFilterCount(
  group: WorkbenchFilterGroup,
  capabilities: WorkbenchQueryCapabilities,
): number {
  return group.items.reduce((count, item) => {
    if (isGroup(item)) return count + completeFilterCount(item, capabilities);
    return count + (completeCondition(item, capabilities) ? 1 : 0);
  }, 0);
}

function FilterGroupEditor({
  capabilities,
  copy,
  depth,
  group,
  path,
  onReplace,
}: {
  readonly capabilities: WorkbenchQueryCapabilities;
  readonly copy: SchemaQueryBuilderCopy;
  readonly depth: number;
  readonly group: WorkbenchFilterGroup;
  readonly path: readonly number[];
  readonly onReplace: (
    path: readonly number[],
    replacement?: WorkbenchFilterCondition | WorkbenchFilterGroup,
  ) => void;
}) {
  const firstField = capabilities.filterFields[0];
  return (
    <Paper
      sx={{
        bgcolor: 'background.default',
        borderColor: 'divider',
        borderRadius: 2,
        p: 1,
      }}
      variant="outlined"
    >
      <Stack spacing={1}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
        >
          <TextField
            select
            label={copy.matchLabel}
            size="small"
            sx={{ minWidth: { sm: 180 } }}
            value={group.operator}
            onChange={(event) =>
              onReplace(path, {
                ...group,
                operator: event.target.value as 'AND' | 'OR',
              })
            }
          >
            {capabilities.groupOperators.map((operator) => (
              <MenuItem key={operator} value={operator}>
                {operator === 'AND' ? 'All conditions' : 'Any condition'}
              </MenuItem>
            ))}
          </TextField>
          {path.length > 0 ? (
            <Button
              color="error"
              size="small"
              sx={{ minHeight: 34 }}
              onClick={() => onReplace(path)}
            >
              {copy.removeLabel}
            </Button>
          ) : null}
        </Stack>
        {group.items.map((item, index) => {
          const itemPath = [...path, index];
          if (isGroup(item)) {
            return (
              <FilterGroupEditor
                key={itemPath.join('.')}
                capabilities={capabilities}
                copy={copy}
                depth={depth + 1}
                group={item}
                path={itemPath}
                onReplace={onReplace}
              />
            );
          }
          const field =
            capabilities.filterFields.find(
              (candidate) => candidate.field === item.field,
            ) ?? firstField;
          if (!field) return null;
          return (
            <Paper
              key={itemPath.join('.')}
              sx={{
                bgcolor: 'background.paper',
                borderColor: 'divider',
                borderRadius: 1.5,
                display: 'grid',
                gap: 1,
                gridTemplateColumns: {
                  xs: '1fr',
                  md: 'minmax(180px, 1fr) minmax(170px, 0.8fr) minmax(220px, 2fr) auto',
                },
                p: 1,
              }}
              variant="outlined"
            >
              <TextField
                select
                label={copy.fieldLabel}
                size="small"
                value={field.field}
                onChange={(event) => {
                  const selected = capabilities.filterFields.find(
                    (candidate) => candidate.field === event.target.value,
                  );
                  if (selected) onReplace(itemPath, initialCondition(selected));
                }}
              >
                {capabilities.filterFields.map((candidate) => (
                  <MenuItem key={candidate.field} value={candidate.field}>
                    {candidate.label}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={copy.operatorLabel}
                size="small"
                value={item.operator}
                onChange={(event) =>
                  onReplace(itemPath, {
                    ...item,
                    operator: event.target.value as WorkbenchFilterOperator,
                    value: '',
                  })
                }
              >
                {field.operators.map((operator) => (
                  <MenuItem key={operator} value={operator}>
                    {operatorLabels[operator]}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label={copy.valueLabel}
                size="small"
                select={
                  ['boolean', 'bool'].includes(field.type) ||
                  Boolean(field.enum && item.operator !== 'IN')
                }
                type={
                  ['boolean', 'bool'].includes(field.type) ||
                  Boolean(field.enum && item.operator !== 'IN')
                    ? undefined
                    : ['number', 'int', 'integer'].includes(field.type)
                      ? 'number'
                      : field.type === 'date' && item.operator !== 'BETWEEN'
                        ? 'date'
                        : 'text'
                }
                value={
                  Array.isArray(item.value) ? item.value.join(', ') : String(item.value)
                }
                onChange={(event) =>
                  onReplace(itemPath, {
                    ...item,
                    value: valueFromInput(event.target.value, field, item.operator),
                  })
                }
              >
                {['boolean', 'bool'].includes(field.type)
                  ? [
                      <MenuItem key="true" value="true">
                        True
                      </MenuItem>,
                      <MenuItem key="false" value="false">
                        False
                      </MenuItem>,
                    ]
                  : field.enum?.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
              </TextField>
              <Button
                color="error"
                size="small"
                sx={{ minHeight: 34 }}
                onClick={() => onReplace(itemPath)}
              >
                {copy.removeLabel}
              </Button>
            </Paper>
          );
        })}
        <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap' }} useFlexGap>
          <Button
            disabled={!firstField}
            size="small"
            sx={{ minHeight: 34 }}
            onClick={() =>
              firstField &&
              onReplace(path, {
                ...group,
                items: [...group.items, initialCondition(firstField)],
              })
            }
          >
            {copy.addConditionLabel}
          </Button>
          <Button
            disabled={depth >= 3 || !firstField}
            size="small"
            sx={{ minHeight: 34 }}
            onClick={() =>
              firstField &&
              onReplace(path, {
                ...group,
                items: [
                  ...group.items,
                  { operator: 'AND', items: [initialCondition(firstField)] },
                ],
              })
            }
          >
            {copy.addGroupLabel}
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export function SchemaQueryBuilder({
  capabilities,
  copy,
  sort,
  value,
  onChange,
  onSortChange,
  showTechnicalPreview = false,
}: SchemaQueryBuilderProps) {
  const firstField = capabilities.filterFields[0];
  const [draft, setDraft] = useState(value);
  useEffect(() => {
    setDraft(value);
  }, [value]);
  const canFilter = Boolean(firstField);
  const effectiveSort = sortOrDefault(capabilities, sort);
  const canSort = Boolean(
    effectiveSort && onSortChange && capabilities.sortableFields.length > 0,
  );
  if (!canFilter && !canSort) return null;
  return (
    <Paper
      elevation={0}
      sx={{
        bgcolor: 'background.default',
        border: 1,
        borderColor: 'divider',
        borderRadius: 2,
        p: 1.25,
      }}
    >
      <Stack spacing={1.25}>
        {canSort && effectiveSort && onSortChange ? (
          <Stack spacing={0.75}>
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Typography
                color="text.secondary"
                component="h3"
                sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
                variant="caption"
              >
                {copy.sortBuilderLabel ?? 'Sort results'}
              </Typography>
              <Chip
                label={`${labelForField(capabilities, effectiveSort.field)} · ${effectiveSort.direction}`}
                size="small"
                sx={{ bgcolor: 'action.selected' }}
              />
            </Stack>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
              <TextField
                fullWidth
                select
                label={copy.sortFieldLabel ?? 'Sort field'}
                size="small"
                value={effectiveSort.field}
                onChange={(event) =>
                  onSortChange({
                    field: event.target.value,
                    direction: effectiveSort.direction,
                  })
                }
              >
                {capabilities.sortableFields.map((field) => (
                  <MenuItem key={field} value={field}>
                    {labelForField(capabilities, field)}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                label={copy.sortDirectionLabel ?? 'Direction'}
                size="small"
                sx={{ minWidth: { sm: 180 } }}
                value={effectiveSort.direction}
                onChange={(event) =>
                  onSortChange({
                    field: effectiveSort.field,
                    direction: event.target.value as 'ASC' | 'DESC',
                  })
                }
              >
                <MenuItem value="ASC">{copy.ascendingLabel ?? 'Ascending'}</MenuItem>
                <MenuItem value="DESC">{copy.descendingLabel ?? 'Descending'}</MenuItem>
              </TextField>
            </Stack>
          </Stack>
        ) : null}

        {canSort && canFilter ? <Divider /> : null}

        {canFilter && firstField ? (
          <Box>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              sx={{
                alignItems: { sm: 'center' },
                justifyContent: 'space-between',
                mb: 0.75,
              }}
            >
              <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                <Typography
                  color="text.secondary"
                  component="h3"
                  sx={{ letterSpacing: '0.08em', textTransform: 'uppercase' }}
                  variant="caption"
                >
                  {copy.filterBuilderLabel}
                </Typography>
                <Chip
                  label={
                    draft
                      ? `${completeFilterCount(draft, capabilities).toString()} ready`
                      : (copy.noFiltersSummaryLabel ?? 'No conditions')
                  }
                  size="small"
                  sx={{ bgcolor: 'action.selected' }}
                />
              </Stack>
              <Stack direction="row" spacing={1}>
                {draft ? (
                  <Button
                    color="inherit"
                    size="small"
                    sx={{ minHeight: 34 }}
                    onClick={() => {
                      setDraft(undefined);
                      onChange(undefined);
                    }}
                  >
                    {copy.clearFiltersLabel}
                  </Button>
                ) : null}
                <Button
                  size="small"
                  sx={{ minHeight: 34 }}
                  onClick={() =>
                    setDraft({
                      operator: 'AND',
                      items: [...(draft?.items ?? []), initialCondition(firstField)],
                    })
                  }
                >
                  {copy.addConditionLabel}
                </Button>
              </Stack>
            </Stack>
            {draft ? (
              <>
                <FilterGroupEditor
                  capabilities={capabilities}
                  copy={copy}
                  depth={1}
                  group={draft}
                  path={[]}
                  onReplace={(path, replacement) => {
                    if (path.length === 0) {
                      setDraft(
                        replacement && isGroup(replacement) ? replacement : undefined,
                      );
                      return;
                    }
                    setDraft(replaceAtPath(draft, path, replacement));
                  }}
                />
                <Typography color="text.secondary" sx={{ mt: 1 }} variant="caption">
                  {completeGroup(draft, capabilities)
                    ? 'Conditions are ready. Apply them before previewing records.'
                    : 'Complete all condition values before applying conditions.'}
                </Typography>
                {showTechnicalPreview ? (
                  <>
                    <Typography color="text.secondary" sx={{ mt: 1 }} variant="caption">
                      {copy.requestPreviewLabel}
                    </Typography>
                    <Box
                      component="pre"
                      sx={{
                        bgcolor: 'action.hover',
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        m: 0,
                        mt: 0.5,
                        overflowX: 'auto',
                        p: 1,
                      }}
                    >
                      {JSON.stringify(draft, null, 2)}
                    </Box>
                  </>
                ) : null}
                <Button
                  disabled={!completeGroup(draft, capabilities)}
                  size="small"
                  sx={{ minHeight: 34, mt: 1 }}
                  variant="contained"
                  onClick={() => onChange(draft)}
                >
                  {copy.applyFiltersLabel}
                </Button>
              </>
            ) : (
              <Typography color="text.secondary" variant="body2">
                {copy.noFiltersSummaryLabel ?? 'No advanced conditions are applied.'}
              </Typography>
            )}
          </Box>
        ) : null}
      </Stack>
    </Paper>
  );
}
