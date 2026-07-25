import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useState } from 'react';

import type {
  WorkbenchFilterCondition,
  WorkbenchFilterField,
  WorkbenchFilterGroup,
  WorkbenchFilterOperator,
  WorkbenchQueryCapabilities,
} from '../api/workbenchContracts';

export interface WorkbenchFilterBuilderCopy {
  readonly addConditionLabel: string;
  readonly addGroupLabel: string;
  readonly applyFiltersLabel: string;
  readonly clearFiltersLabel: string;
  readonly fieldLabel: string;
  readonly filterBuilderLabel: string;
  readonly matchLabel: string;
  readonly operatorLabel: string;
  readonly removeLabel: string;
  readonly requestPreviewLabel: string;
  readonly valueLabel: string;
}

interface WorkbenchFilterBuilderProps {
  readonly capabilities: WorkbenchQueryCapabilities;
  readonly copy: WorkbenchFilterBuilderCopy;
  readonly value?: WorkbenchFilterGroup | undefined;
  readonly onChange: (value?: WorkbenchFilterGroup) => void;
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

function completeGroup(
  group: WorkbenchFilterGroup,
  capabilities: WorkbenchQueryCapabilities,
): boolean {
  return (
    group.items.length > 0 &&
    group.items.every((item) => {
      if (isGroup(item)) return completeGroup(item, capabilities);
      const field = capabilities.filterFields.find(
        (candidate) => candidate.field === item.field,
      );
      if (!field || !field.operators.includes(item.operator)) return false;
      if (Array.isArray(item.value)) {
        return (
          item.value.length > 0 &&
          (item.operator !== 'BETWEEN' || item.value.length === 2)
        );
      }
      if (typeof item.value === 'number') return Number.isFinite(item.value);
      return typeof item.value !== 'string' || item.value.trim().length > 0;
    })
  );
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
  readonly copy: WorkbenchFilterBuilderCopy;
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
    <Paper sx={{ bgcolor: 'background.default', p: 1.5 }} variant="outlined">
      <Stack spacing={1.5}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <TextField
            select
            label={copy.matchLabel}
            size="small"
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
            <Button color="error" onClick={() => onReplace(path)}>
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
            <Stack
              key={itemPath.join('.')}
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
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
              <Button color="error" onClick={() => onReplace(itemPath)}>
                {copy.removeLabel}
              </Button>
            </Stack>
          );
        })}
        <Stack direction="row" spacing={1}>
          <Button
            disabled={!firstField}
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

export function WorkbenchFilterBuilder({
  capabilities,
  copy,
  value,
  onChange,
}: WorkbenchFilterBuilderProps) {
  const firstField = capabilities.filterFields[0];
  const [draft, setDraft] = useState(value);
  if (!firstField) return null;
  return (
    <Box>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between', mb: 1 }}
      >
        <Typography component="h3" variant="subtitle1">
          {copy.filterBuilderLabel}
        </Typography>
        {draft ? (
          <Button
            color="inherit"
            onClick={() => {
              setDraft(undefined);
              onChange(undefined);
            }}
          >
            {copy.clearFiltersLabel}
          </Button>
        ) : (
          <Button
            onClick={() =>
              setDraft({
                operator: 'AND',
                items: [initialCondition(firstField)],
              })
            }
          >
            {copy.addConditionLabel}
          </Button>
        )}
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
                setDraft(replacement && isGroup(replacement) ? replacement : undefined);
                return;
              }
              setDraft(replaceAtPath(draft, path, replacement));
            }}
          />
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
          <Button
            disabled={!completeGroup(draft, capabilities)}
            sx={{ mt: 1 }}
            variant="contained"
            onClick={() => onChange(draft)}
          >
            {copy.applyFiltersLabel}
          </Button>
        </>
      ) : null}
    </Box>
  );
}
