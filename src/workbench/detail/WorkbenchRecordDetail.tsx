import { Box, Button, Divider, Stack, Typography } from '@mui/material';

import type { WorkbenchRecord, WorkbenchSchema } from '../api/workbenchContracts';
import {
  containerFieldNames,
  workbenchRecordValue,
} from '../record/workbenchRecordPaths';

interface WorkbenchRecordDetailProps {
  readonly closeLabel: string;
  readonly editLabel: string;
  readonly deleteLabel: string;
  readonly falseLabel: string;
  readonly record: WorkbenchRecord;
  readonly schema: WorkbenchSchema;
  readonly trueLabel: string;
  readonly onClose: () => void;
  readonly onEdit: () => void;
  readonly onDelete: () => void;
}

function displayValue(
  value: unknown,
  type?: string,
  trueLabel = 'true',
  falseLabel = 'false',
): string {
  if (value === undefined || value === null || value === '') return '—';
  if (Array.isArray(value)) {
    return value
      .map((item) => displayValue(item, type, trueLabel, falseLabel))
      .join(', ');
  }
  if (type === 'date' && (typeof value === 'string' || typeof value === 'number')) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(date);
    }
  }
  if (typeof value === 'string' || typeof value === 'number') return String(value);
  if (typeof value === 'boolean') return value ? trueLabel : falseLabel;
  return '—';
}

export function WorkbenchRecordDetail(props: WorkbenchRecordDetailProps) {
  const containerFields = containerFieldNames(props.schema.fields);
  return (
    <Stack spacing={2}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1}
        sx={{ alignItems: { sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Typography component="h3" variant="h6">
          {displayValue(
            workbenchRecordValue(props.record, props.schema.displayProperty) ??
              props.schema.label,
            props.schema.fields.find(
              (field) => field.name === props.schema.displayProperty,
            )?.type,
            props.trueLabel,
            props.falseLabel,
          )}
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button onClick={props.onClose}>{props.closeLabel}</Button>
          {props.schema.operations.includes('update') ? (
            <Button variant="contained" onClick={props.onEdit}>
              {props.editLabel}
            </Button>
          ) : null}
          {props.schema.operations.includes('delete') ? (
            <Button color="error" onClick={props.onDelete}>
              {props.deleteLabel}
            </Button>
          ) : null}
        </Stack>
      </Stack>
      <Divider />
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        {props.schema.fields
          .filter((field) => !containerFields.has(field.name))
          .map((field) => (
          <Box key={field.name}>
            <Typography color="text.secondary" variant="caption">
              {field.label}
            </Typography>
            <Typography sx={{ overflowWrap: 'anywhere' }}>
              {displayValue(
                workbenchRecordValue(props.record, field.name),
                field.type,
                props.trueLabel,
                props.falseLabel,
              )}
            </Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
