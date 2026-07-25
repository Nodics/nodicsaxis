import { TextField } from '@mui/material';

import type { WorkbenchFieldProps } from '../WorkbenchFieldProps';

export function NumberFieldRenderer({
  error,
  field,
  onChange,
  value,
}: WorkbenchFieldProps) {
  return (
    <TextField
      error={Boolean(error)}
      fullWidth
      helperText={error ?? field.description}
      label={field.label}
      required={field.required}
      type="number"
      value={typeof value === 'number' ? value : ''}
      onChange={(event) =>
        onChange(event.target.value === '' ? undefined : Number(event.target.value))
      }
    />
  );
}
