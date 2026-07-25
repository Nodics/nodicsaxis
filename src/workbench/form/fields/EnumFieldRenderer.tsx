import { MenuItem, TextField } from '@mui/material';

import type { WorkbenchFieldProps } from '../WorkbenchFieldProps';

export function EnumFieldRenderer({
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
      select
      value={typeof value === 'string' ? value : ''}
      onChange={(event) => onChange(event.target.value)}
    >
      <MenuItem value="">Select {field.label}</MenuItem>
      {field.enum?.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </TextField>
  );
}
