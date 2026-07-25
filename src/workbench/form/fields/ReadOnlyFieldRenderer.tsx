import { TextField } from '@mui/material';

import type { WorkbenchFieldProps } from '../WorkbenchFieldProps';

export function ReadOnlyFieldRenderer({ field, value }: WorkbenchFieldProps) {
  return (
    <TextField
      disabled
      fullWidth
      helperText={field.description}
      label={field.label}
      value={typeof value === 'string' || typeof value === 'number' ? value : ''}
    />
  );
}
