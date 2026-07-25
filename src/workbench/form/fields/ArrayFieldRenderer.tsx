import { TextField } from '@mui/material';

import type { WorkbenchFieldProps } from '../WorkbenchFieldProps';

export function ArrayFieldRenderer({
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
      multiline
      required={field.required}
      rows={2}
      value={Array.isArray(value) ? value.join(', ') : ''}
      onChange={(event) =>
        onChange(
          event.target.value
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        )
      }
    />
  );
}
